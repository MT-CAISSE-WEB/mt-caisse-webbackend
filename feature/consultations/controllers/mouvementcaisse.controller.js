const { QueryTypes } = require("sequelize");
const sequelize = require("../../../config/database"); // adapte ton path

exports.getStatsCaisseMensuelle = async (req, res) => {
  try {
    const { idsociete, idsite } = req.query;

    if (!idsociete || !idsite) {
      return res.status(400).json({
        success: false,
        message: "idsociete et idsite sont obligatoires",
      });
    }

    const stats = await sequelize.query(
      //   `
      //   SELECT
      //       c.idcaisse,
      //       c.libelle AS libellecaisse,
      //       DAY(e.dateoperation) AS jour,

      //       SUM(CASE
      //           WHEN t.codtypeoperation = 'encaissement' THEN t.montant
      //           ELSE 0
      //       END) AS total_entrees,

      //       SUM(CASE
      //           WHEN t.codtypeoperation = 'decaissement' THEN t.montant
      //           ELSE 0
      //       END) AS total_sorties,

      //       SUM(
      //         CASE
      //             WHEN t.codtypeoperation IN ('encaissement', 'ENTREE') THEN t.montant
      //             WHEN t.codtypeoperation IN ('decaissement', 'SORTIE') THEN -t.montant
      //             ELSE 0
      //         END
      //         ) AS solde

      //   FROM EnteteOperationCaisse e

      //   INNER JOIN TypeOperation t
      //       ON t.idoperation = e.idoperation

      //   INNER JOIN Caisse c
      //       ON c.idcaisse = t.idcaisse

      //   WHERE
      //       e.idsociete = :idsociete
      //       AND e.idsite = :idsite
      //       AND MONTH(e.dateoperation) = 12
      //       AND YEAR(e.dateoperation) = 2025

      //   GROUP BY
      //       c.idcaisse,
      //       c.libelle,
      //       DAY(e.dateoperation)

      //   ORDER BY
      //       c.libelle,
      //       jour
      //   `,
      `
    WITH jours AS (
        SELECT 1 AS jour
        UNION ALL
        SELECT jour + 1
        FROM jours
        WHERE jour + 1 <= DAY(EOMONTH(GETDATE()))
    ),

      -- Toutes les caisses
      caisses AS (
          SELECT idcaisse, libelle, soldeinitialisation
          FROM Caisse
          WHERE idsociete = :idsociete AND idsite = idsite
      ),

      -- Données réelles
      data_ops AS (
          SELECT 
              t.idcaisse,
              DAY(e.dateoperation) AS jour,

              SUM(CASE 
                  WHEN t.codtypeoperation IN ('encaissement','ENTREE') THEN t.montant 
                  ELSE 0 
              END) AS total_entrees,

              SUM(CASE 
                  WHEN t.codtypeoperation IN ('decaissement','SORTIE') THEN t.montant 
                  ELSE 0 
              END) AS total_sorties,

              SUM(
                  CASE 
                      WHEN t.codtypeoperation IN ('encaissement','ENTREE') THEN t.montant 
                      WHEN t.codtypeoperation IN ('decaissement','SORTIE') THEN -t.montant
                      ELSE 0
                  END
              ) AS mouvement

          FROM EnteteOperationCaisse e
          INNER JOIN TypeOperation t ON t.idoperation = e.idoperation

          WHERE 
              e.idsociete = :idsociete
              AND e.idsite = :idsite
              AND MONTH(e.dateoperation) = MONTH(GETDATE())
              AND YEAR(e.dateoperation) = YEAR(GETDATE())

          GROUP BY 
              t.idcaisse,
              DAY(e.dateoperation)
      )

      -- RESULTAT FINAL
      SELECT 
          c.idcaisse,
          c.libelle AS libellecaisse,
          j.jour,

          ISNULL(d.total_entrees, 0) AS total_entrees,
          ISNULL(d.total_sorties, 0) AS total_sorties,

          -- SOLDE CUMULÉ
          c.soldeinitialisation +
          SUM(ISNULL(d.mouvement, 0)) OVER (
              PARTITION BY c.idcaisse
              ORDER BY j.jour
              ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
          ) AS solde_reel

      FROM caisses c
      CROSS JOIN jours j

      LEFT JOIN data_ops d
          ON d.idcaisse = c.idcaisse
          AND d.jour = j.jour

      ORDER BY 
          c.libelle,
          j.jour
    `,
      {
        replacements: { idsociete, idsite },
        type: QueryTypes.SELECT,
      },
    );

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Erreur stats journalières caisse :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};
