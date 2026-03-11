const EnteteDemande = require("../models/enteteDemande.model");
const { fn, col, literal } = require("sequelize");

exports.getDemandesParStatut = async (req, res) => {
  try {
    const libelleStatutCase = `
      CASE 
        WHEN statut = 0 THEN 'en attente'
        WHEN statut = 1 THEN 'accepté'
        WHEN statut = 2 THEN 'rejeté'
        ELSE 'inconnu'
      END
    `;

    const stats = await EnteteDemande.findAll({
      attributes: [
        "statut",
        "typedemande", // <-- ajouté

        // Libellé métier du statut
        [literal(libelleStatutCase), "libelleStatut"],

        // Nombre de demandes
        [fn("COUNT", col("iddemande")), "total"],
      ],

      group: [
        "statut",
        "typedemande", // GROUP BY
        literal(libelleStatutCase),
      ],

      order: [
        ["typedemande", "ASC"],
        ["statut", "ASC"],
      ],
    });

    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
