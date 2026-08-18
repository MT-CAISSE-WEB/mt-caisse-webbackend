const { QueryTypes } = require("sequelize");
const sequelize = require("../../../config/database");

exports.getStatsCaisseMensuelle = async (req, res) => {
  try {
    const { idsociete, idsite, dateDebut, dateFin } = req.query;

    if (!idsociete) {
      return res.status(400).json({
        success: false,
        message: "idsociete est obligatoire",
      });
    }

    let stats;

    // Si les dates sont fournies => plage personnalisée
    if (dateDebut && dateFin) {
      // Validation simple : dateFin >= dateDebut
      if (new Date(dateFin) < new Date(dateDebut)) {
        return res.status(400).json({
          success: false,
          message: "dateFin doit être postérieure ou égale à dateDebut",
        });
      }

      // Limiter la plage à 1 an pour éviter une récursion trop longue
      const diffDays = Math.ceil(
        (new Date(dateFin) - new Date(dateDebut)) / (1000 * 60 * 60 * 24),
      );
      if (diffDays > 365) {
        return res.status(400).json({
          success: false,
          message: "La plage ne peut pas dépasser 365 jours",
        });
      }

      stats = await sequelize.query(
        `
        WITH caisses AS (
          SELECT idcaisse, libelle
          FROM Caisse
          WHERE idsociete = :idsociete
          ${idsite ? "AND idsite = :idsite" : ""}
        ),
        jours AS (
          SELECT idcaisse, CAST(:dateDebut AS DATE) AS jour
          FROM caisses
          UNION ALL
          SELECT j.idcaisse, DATEADD(DAY, 1, j.jour)
          FROM jours j
          WHERE j.jour < CAST(:dateFin AS DATE)
        ),
        data_ops AS (
          SELECT 
            t.idcaisse,
            CAST(e.dateoperation AS DATE) AS jour,
            SUM(CASE WHEN t.codtypeoperation IN ('encaissement','ENTREE') THEN t.montant ELSE 0 END) AS total_entrees,
            SUM(CASE WHEN t.codtypeoperation IN ('decaissement','SORTIE') THEN t.montant ELSE 0 END) AS total_sorties,
            SUM(CASE WHEN t.codtypeoperation IN ('encaissement','ENTREE') THEN t.montant 
                     WHEN t.codtypeoperation IN ('decaissement','SORTIE') THEN -t.montant ELSE 0 END) AS mouvement
          FROM EnteteOperationCaisse e
          INNER JOIN TypeOperation t ON t.idoperation = e.idoperation
          WHERE e.idsociete = :idsociete
            ${idsite ? "AND e.idsite = :idsite" : ""}
            AND e.dateoperation BETWEEN CAST(:dateDebut AS DATE) AND CAST(:dateFin AS DATE)
          GROUP BY t.idcaisse, CAST(e.dateoperation AS DATE)
        ),
        soldes AS (
          SELECT idcaisse, dateperiode AS jour, soldefermeture
          FROM CaissePeriode
          WHERE dateperiode BETWEEN CAST(:dateDebut AS DATE) AND CAST(:dateFin AS DATE)
        )
        SELECT 
          c.idcaisse,
          c.libelle AS libellecaisse,
          j.jour,
          ISNULL(d.total_entrees, 0) AS total_entrees,
          ISNULL(d.total_sorties, 0) AS total_sorties,
          ISNULL(s.soldefermeture,
            SUM(ISNULL(d.mouvement, 0)) OVER (
              PARTITION BY c.idcaisse
              ORDER BY j.jour
              ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            )
          ) AS solde
        FROM caisses c
        INNER JOIN jours j ON j.idcaisse = c.idcaisse
        LEFT JOIN data_ops d ON d.idcaisse = c.idcaisse AND d.jour = j.jour
        LEFT JOIN soldes s ON s.idcaisse = c.idcaisse AND s.jour = j.jour
        ORDER BY c.libelle, j.jour
        OPTION (MAXRECURSION 0)
        `,
        {
          replacements: { idsociete, idsite, dateDebut, dateFin },
          type: QueryTypes.SELECT,
        },
      );
    } else {
      // Sinon, comportement actuel : 30 jours avant la dernière période
      stats = await sequelize.query(
        `
        WITH derniere_periode AS (
          SELECT 
            cp.idcaisse,
            cp.dateperiode,
            ROW_NUMBER() OVER (PARTITION BY cp.idcaisse ORDER BY cp.dateperiode DESC) AS rn
          FROM CaissePeriode cp
        ),
        periode_active AS (
          SELECT idcaisse, dateperiode
          FROM derniere_periode
          WHERE rn = 1
        ),
        caisses AS (
          SELECT 
            c.idcaisse,
            c.libelle,
            p.dateperiode
          FROM Caisse c
          INNER JOIN periode_active p ON p.idcaisse = c.idcaisse
          WHERE 
            c.idsociete = :idsociete
            ${idsite ? "AND c.idsite = :idsite" : ""}
        ),
        jours AS (
          SELECT 
            p.idcaisse,
            CAST(DATEADD(DAY, -29, p.dateperiode) AS DATE) AS jour,
            p.dateperiode AS date_ref
          FROM periode_active p
          UNION ALL
          SELECT 
            j.idcaisse,
            DATEADD(DAY, 1, j.jour),
            j.date_ref
          FROM jours j
          WHERE j.jour < j.date_ref
        ),
        data_ops AS (
          SELECT 
            t.idcaisse,
            CAST(e.dateoperation AS DATE) AS jour,
            SUM(CASE WHEN t.codtypeoperation IN ('encaissement','ENTREE') THEN t.montant ELSE 0 END) AS total_entrees,
            SUM(CASE WHEN t.codtypeoperation IN ('decaissement','SORTIE') THEN t.montant ELSE 0 END) AS total_sorties,
            SUM(CASE WHEN t.codtypeoperation IN ('encaissement','ENTREE') THEN t.montant 
                     WHEN t.codtypeoperation IN ('decaissement','SORTIE') THEN -t.montant ELSE 0 END) AS mouvement
          FROM EnteteOperationCaisse e
          INNER JOIN TypeOperation t ON t.idoperation = e.idoperation
          INNER JOIN periode_active p ON p.idcaisse = t.idcaisse
          WHERE 
            e.idsociete = :idsociete
            ${idsite ? "AND e.idsite = :idsite" : ""}
            AND e.dateoperation >= DATEADD(DAY, -30, p.dateperiode)
            AND e.dateoperation <= p.dateperiode
          GROUP BY 
            t.idcaisse,
            CAST(e.dateoperation AS DATE)
        ),
        soldes AS (
          SELECT 
            cp.idcaisse,
            CAST(cp.dateperiode AS DATE) AS jour,
            cp.soldefermeture
          FROM CaissePeriode cp
        )
        SELECT 
          c.idcaisse,
          c.libelle AS libellecaisse,
          j.jour,
          ISNULL(d.total_entrees, 0) AS total_entrees,
          ISNULL(d.total_sorties, 0) AS total_sorties,
          ISNULL(s.soldefermeture,
            SUM(ISNULL(d.mouvement, 0)) OVER (
              PARTITION BY c.idcaisse
              ORDER BY j.jour
              ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            )
          ) AS solde
        FROM caisses c
        INNER JOIN jours j ON j.idcaisse = c.idcaisse
        LEFT JOIN data_ops d ON d.idcaisse = c.idcaisse AND d.jour = j.jour
        LEFT JOIN soldes s ON s.idcaisse = c.idcaisse AND s.jour = j.jour
        ORDER BY 
          c.libelle,
          j.jour
        OPTION (MAXRECURSION 30)
        `,
        {
          replacements: { idsociete, idsite },
          type: QueryTypes.SELECT,
        },
      );
    }

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Erreur stats caisse :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};
