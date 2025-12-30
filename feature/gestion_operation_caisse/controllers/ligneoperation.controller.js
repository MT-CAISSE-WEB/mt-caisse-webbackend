const ligneoperationservice = require("../services/ligneoperation.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste toutes les ligne operations
 */
module.exports.get_ligneoperations = asyncHandler(async(req, res, next) => {
  try {
    const ligneoperations = await ligneoperationservice.get_all_ligneoperations();
    res.json({ success: true, data: ligneoperations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Une ligne operation existante par son id
 */
module.exports.get_oneligneoperation = asyncHandler(async(req, res, next) => {
  try {
    const idligneoperation  = req.params.id;
    const ligneoperation_ = await ligneoperationservice.get_by_idligneoperation(idligneoperation);
    res.json({ success: true, data: ligneoperation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée une nouvelle ligne operation
 */
module.exports.create_ligneoperation = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_ligneoperation = await ligneoperationservice.create_ligneoperation(data);
    res.status(201).json({ success: true, data: new_ligneoperation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour une ligne operation existante
 */
module.exports.update_ligneoperation = asyncHandler(async(req, res, next) => {
  try {
    const idligneoperation  = req.params.id;
    const ligneoperation_ = await ligneoperationservice.update_ligneoperation(idligneoperation, req.body);
    res.json({ success: true, data: ligneoperation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime une ligne operation
 */
module.exports.delete_ligneoperation = asyncHandler(async(req, res, next) => {
  try {
    const idligneoperation = req.params.id;
    const ligneoperation_ = await ligneoperationservice.delete_ligneoperation(idligneoperation);
    res.json({ success: true, message: "ligne operation supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
