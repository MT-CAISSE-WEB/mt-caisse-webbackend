const EnteteDemande = require("../models/enteteDemande.model");
const { fn, col, literal } = require("sequelize");

// exports.getDemandesParStatut = async (req, res) => {
//   try {
//     const libelleStatutCase = `
//       CASE
//         WHEN statut = 0 THEN 'en attente'
//         WHEN statut = 1 THEN 'accepté'
//         WHEN statut = 2 THEN 'rejeté'
//         ELSE 'inconnu'
//       END
//     `;

//     const stats = await EnteteDemande.findAll({
//       attributes: [
//         "statut",
//         "typedemande", // <-- ajouté

//         // Libellé métier du statut
//         [literal(libelleStatutCase), "libelleStatut"],

//         // Nombre de demandes
//         [fn("COUNT", col("iddemande")), "total"],
//       ],

//       group: [
//         "statut",
//         "typedemande", // GROUP BY
//         literal(libelleStatutCase),
//       ],

//       order: [
//         ["typedemande", "ASC"],
//         ["statut", "ASC"],
//       ],
//     });

//     res.json({
//       success: true,
//       data: stats,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };

exports.getDemandesParStatut = async (req, res) => {
  try {
    /* ======================================================
       0. PARAMÈTRES QUERY
    ====================================================== */

    const { idsociete, idsite } = req.query;

    /* ======================================================
       1. VALIDATION
    ====================================================== */

    if (!idsociete) {
      return res.status(400).json({
        success: false,
        message: "Le paramètre idsociete est obligatoire",
      });
    }

    /* ======================================================
       2. CONSTRUCTION DU SCOPE (COMME TON AUTRE API)
    ====================================================== */

    const scopeDemande = { idsociete };

    if (idsite) {
      scopeDemande.idsite = idsite;
    }

    /* ======================================================
       3. CASE STATUT
    ====================================================== */

    const libelleStatutCase = `
      CASE 
        WHEN statut = 0 THEN 'en attente'
        WHEN statut = 1 THEN 'accepté'
        WHEN statut = 2 THEN 'rejeté'
        ELSE 'inconnu'
      END
    `;

    /* ======================================================
       4. REQUÊTE
    ====================================================== */

    const stats = await EnteteDemande.findAll({
      attributes: [
        "statut",
        "typedemande",

        [literal(libelleStatutCase), "libelleStatut"],
        [fn("COUNT", col("iddemande")), "total"],
      ],

      where: scopeDemande,

      group: ["statut", "typedemande", literal(libelleStatutCase)],

      order: [
        ["typedemande", "ASC"],
        ["statut", "ASC"],
      ],
    });

    /* ======================================================
       5. RÉPONSE
    ====================================================== */

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Erreur stats :", error);

    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};
