const { EnteteDemande, LigneDemande, Departement } = require("../models/index");
const { fn, col } = require("sequelize");

exports.getMontantParDepartement = async (req, res) => {
  try {
    const stats = await EnteteDemande.findAll({
      attributes: [
        [col("EnteteDemande.iddepartement"), "iddepartement"],
        [col("departement.libelle"), "libelleDepartement"],
        [fn("SUM", col("lignes.montantdemande")), "total"],
      ],
      include: [
        {
          model: LigneDemande,
          as: "lignes",
          attributes: [],
        },
        {
          model: Departement,
          as: "departement",
          attributes: [],
        },
      ],
      group: ["EnteteDemande.iddepartement", "departement.libelle"],
      raw: true, // IMPORTANT → évite l'ajout automatique de iddemande
    });

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
