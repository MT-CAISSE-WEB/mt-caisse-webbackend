const {
  DetailsJustificatifOperation,
  NatureOperation,
  CentreAnalytique,
  Tiers,
  JustificatifOperation,
} = require("../models");

/* ======================================================
   CREATE
====================================================== */
exports.create = async (req, res) => {
  try {
    const detail = await DetailsJustificatifOperation.create(req.body);

    res.status(201).json({
      success: true,
      message: "Détail justificatif créé avec succès",
      data: detail,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création",
      error: error.message,
    });
  }
};

/* ======================================================
   GET ALL (avec relations Foreign Keys)
====================================================== */
exports.findAll = async (req, res) => {
  try {
    const details = await DetailsJustificatifOperation.findAll({
      include: [
        {
          model: NatureOperation,
          as: "nature",
          attributes: ["idnature", "codenature", "libelle"],
        },
        {
          model: CentreAnalytique,
          as: "centreAnalytique",
          attributes: ["idcentreanalytique", "codecentreanalytique", "libelle"],
        },
        {
          model: Tiers,
          as: "tiers",
          attributes: ["idtiers", "codetiers", "designation"],
        },
        {
          model: JustificatifOperation,
          as: "justificatif",
          attributes: ["idjustificatifoperation", "codejustificatif"],
        },
      ],
    });

    res.status(200).json({success: true, data: details});
  } catch (error) {
    res.status(500).json({
      message: "Erreur récupération détails",
      error: error.message,
    });
  }
};

/* ======================================================
   GET ONE (par ID)
====================================================== */
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;

    const detail = await DetailsJustificatifOperation.findByPk(id, {
      include: ["nature", "centreAnalytique", "tiers", "justificatif"],
    });

    if (!detail) {
      return res.status(404).json({
        message: "Détail justificatif introuvable",
      });
    }

    res.status(200).json({success: true, data: detail});
  } catch (error) {
    res.status(500).json({
      message: "Erreur récupération détail",
      error: error.message,
    });
  }
};

/* ======================================================
   UPDATE
====================================================== */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const detail = await DetailsJustificatifOperation.findByPk(id);

    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Détail justificatif introuvable",
      });
    }

    await detail.update(req.body);

    res.status(200).json({
      success: true,
      message: "Détail justificatif mis à jour avec succès",
      data: detail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur mise à jour",
      error: error.message,
    });
  }
};

/* ======================================================
   DELETE
====================================================== */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const detail = await DetailsJustificatifOperation.findByPk(id);

    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Détail justificatif introuvable",
      });
    }

    await detail.destroy();

    res.status(200).json({
      success: true,
      message: "Détail justificatif supprimé avec succès",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur suppression",
      error: error.message,
    });
  }
};
