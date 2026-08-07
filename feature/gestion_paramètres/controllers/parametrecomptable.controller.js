const parametereservice = require("../services/parametrecomptable.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Get tous les paramètres comptables
 */
module.exports.getParametreComptable = asyncHandler(async (req, res, next) => {
  try {
    const data = req.body;
    const params = await parametereservice.getall(data);
    res.json({ success: true, data: params });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Save paramètre comptable */
module.exports.saveParametreComptable = asyncHandler(async (req, res, next) => {
  try {
    const data = req.body;
    const parametre = await parametereservice.save(data);
    res.status(201).json({ success: true, data: parametre });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports.getAllCorrespondance = asyncHandler(async (req, res) => {
  try {
    const items = await parametereservice.findAllcorrespondance();
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports.getCorrespondanceById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const item = await parametereservice.findCorrespondanceById(id);
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    if (error.message === "Correspondance non trouvée") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports.createCorrespondance = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?.id || "system";
    const newItem = await parametereservice.createCorrespondance(
      req.body,
      userId,
    );
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports.updateCorrespondance = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || "system";
    const updated = await parametereservice.updateCorrespondance(
      id,
      req.body,
      userId,
    );
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la correspondance:", error);

    // Format standardisé pour toutes les erreurs
    const errorResponse = {
      success: false,
      message: error.message || "Erreur lors de la mise à jour",
    };

    if (error.message === "Correspondance non trouvée") {
      return res.status(404).json(errorResponse);
    }

    // Gestion des erreurs de conflit (doublon)
    if (error.message.includes("existe déjà")) {
      return res.status(409).json(errorResponse);
    }

    res.status(400).json(errorResponse);
  }
});
module.exports.hardDelete = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await parametereservice.hardDeleteCorrespondance(id);
    res.status(204).send({ success: true });
  } catch (error) {
    if (error.message === "Correspondance non trouvée") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

/**
 * Save paramètre analytique entite-site */
module.exports.saveAnalytiqueEntiteSite = asyncHandler(
  async (req, res, next) => {
    try {
      const data = req.body;
      const parametre = await parametereservice.saveAnalytiqueEntiteSite(data);
      res.status(201).json({ success: true, data: parametre });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
);

/**
 * Save paramètre analytique table correspondance */
module.exports.saveAnalytiqueTable = asyncHandler(async (req, res, next) => {
  try {
    const data = req.body;
    const parametre = await parametereservice.saveAnalytiqueTable(data);
    res.status(201).json({ success: true, data: parametre });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Save paramètre analytique axe second */
module.exports.saveAxeSecond = asyncHandler(async (req, res, next) => {
  try {
    const data = req.body;
    const parametre = await parametereservice.saveAxeSecond(data);
    res.status(201).json({ success: true, data: parametre });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Save paramètre analytique axe second */
module.exports.saveAxisLabel = asyncHandler(async (req, res, next) => {
  try {
    const data = req.body;
    const parametre = await parametereservice.saveAxisLabels(data);
    res.status(201).json({ success: true, data: parametre });
  } catch (error) {
    console.log("Voir des erreurs ", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Importer des correspondances depuis un fichier CSV
 */
module.exports.importCorrespondancesFromCsv = asyncHandler(
  async (req, res, next) => {
    try {
      const userId = req.user?.id || "system";
      const societeId = req.user?.idsociete;

      const { csvData, csvColumns } = req;

      const result = await parametereservice.importCorrespondancesFromCsv(
        csvData,
        csvColumns,
        userId,
        societeId,
      );

      res.status(200).json({
        success: true,
        data: {
          totalLignes: result.total,
          importees: result.imported,
          erreurs: result.errors,
          details: result.details || [],
          resume: result.resume || {},
        },
      });
    } catch (error) {
      console.error("Erreur lors de l'import CSV:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'import du fichier CSV",
        error: error.message,
      });
    }
  },
);
