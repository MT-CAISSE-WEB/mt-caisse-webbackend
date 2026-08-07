const motifservice = require("../services/motif.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste tous les motifs avec pagination
 */
module.exports.get_motifs = asyncHandler(async (req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const search = req.query.search || null;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const actif = req.query.actif || null;

    const paginationResult = await motifservice.getall({
      page,
      limit,
      search,
      actif,
    });

    // Renvoyer la réponse correctement structurée
    res.json({
      success: true,
      data: paginationResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
});

/**
 * Un motif existant par son id
 */
module.exports.get_onemotif = asyncHandler(async (req, res, next) => {
  try {
    const idmotif = req.params.id;
    const motif_ = await motifservice.getOne(idmotif);
    res.json({ success: true, data: motif_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée un nouveau motif
 */
module.exports.createmotif = asyncHandler(async (req, res, next) => {
  try {
    const data = req.body;
    const motif = await motifservice.create(data);
    res.status(201).json({ success: true, data: motif });
  } catch (error) {
    if (error.message.includes("duplicate key")) {
      return res
        .status(400)
        .json({ success: false, message: "Le code motif existe déjà." });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour un motif existante
 */
module.exports.update_motif = asyncHandler(async (req, res, next) => {
  try {
    const idmotif = req.params.id;
    const motif_ = await motifservice.update(idmotif, req.body);
    res.json({ success: true, data: motif_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime un motif
 */
module.exports.delete_motif = asyncHandler(async (req, res, next) => {
  try {
    const idmotif = req.params.id;
    const motif_ = await motifservice.delete_motif(idmotif);
    res.json({ success: true, message: "Motif supprimé" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
