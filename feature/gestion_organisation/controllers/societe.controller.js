const societeservice = require("../services/societe.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste toutes les societes
 */
module.exports.get_societes = asyncHandler(async(req, res, next) => {
  try {
    const societes = await societeservice.get_all_societes();
    res.json({ success: true, data: societes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Une societe existant par son id
 */
module.exports.get_onesociete = asyncHandler(async(req, res, next) => {
  try {
    const idsociete  = req.params.id;
    const societe_ = await societeservice.get_onesociete(idsociete);
    res.json({ success: true, data: societe_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée une nouvelle societe
 */
module.exports.create_societe = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_societe = await societeservice.create_societe(data);
    res.status(201).json({ success: true, data: new_societe });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour une societe existante
 */
module.exports.update_societe = asyncHandler(async(req, res, next) => {
  try {
    const idsociete  = req.params.id;
    const societe_ = await societeservice.update_societe(idsociete, req.body);
    res.json({ success: true, data: societe_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime une societe
 */
module.exports.delete_societe = asyncHandler(async(req, res, next) => {
  try {
    const idsociete = req.params.id;
    const societe_ = await societeservice.delete_societe(idsociete);
    res.json({ success: true, message: "Societe supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
