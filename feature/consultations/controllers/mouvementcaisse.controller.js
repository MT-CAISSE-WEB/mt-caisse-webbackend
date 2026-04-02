const { QueryTypes } = require("sequelize");
const sequelize = require("../../../config/database");

exports.getStatsCaisseMensuelle = async (req, res) => {
  try {
    const { idsociete, idsite } = req.query;

    if (!idsociete) {
      return res.status(400).json({
        success: false,
        message: "idsociete est obligatoire",
      });
    }

    const stats = await sequelize.query(
      `
WITH derniere_periode AS (
    SELECT 
        cp.idcaisse,
        cp.dateperiode,
        ROW_NUMBER() OVER (PARTITION BY cp.idcaisse ORDER BY cp.dateperiode DESC) AS rn
    FROM CaissePeriode cp
),

-- ✅ Une période PAR caisse
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

-- ✅ Génération des 30 jours PAR caisse
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

-- ✅ Mouvements limités à la période de CHAQUE caisse
data_ops AS (
    SELECT 
        t.idcaisse,
        CAST(e.dateoperation AS DATE) AS jour,

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

-- ✅ Soldes réels (source métier)
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

    -- ✅ Solde robuste
    ISNULL(s.soldefermeture,
        SUM(ISNULL(d.mouvement, 0)) OVER (
            PARTITION BY c.idcaisse
            ORDER BY j.jour
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        )
    ) AS solde

FROM caisses c
INNER JOIN jours j 
    ON j.idcaisse = c.idcaisse

LEFT JOIN data_ops d
    ON d.idcaisse = c.idcaisse
    AND d.jour = j.jour

LEFT JOIN soldes s
    ON s.idcaisse = c.idcaisse
    AND s.jour = j.jour

ORDER BY 
    c.libelle,
    j.jour

OPTION (MAXRECURSION 30);
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
    console.error("Erreur stats caisse 30 jours :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};
