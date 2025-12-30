const enteteoperationservice = require("../services/enteteoperation.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste toutes les enteteoperations
 */
module.exports.get_enteteoperations = asyncHandler(async(req, res, next) => {
  try {
    const enteteoperations = await enteteoperationservice.get_all_enteteoperations();
    res.json({ success: true, data: enteteoperations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Une enteteoperation existant par son id
 */
module.exports.get_oneenteteoperation = asyncHandler(async(req, res, next) => {
  try {
    const identeteoperation  = req.params.id;
    const enteteoperation_ = await enteteoperationservice.get_by_identeteoperation(identeteoperation);
    res.json({ success: true, data: enteteoperation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée une nouvelle enteteoperation
 */
module.exports.create_enteteoperation = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_enteteoperation = await enteteoperationservice.create_enteteoperation(data);
    res.status(201).json({ success: true, data: new_enteteoperation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour une enteteoperation existante
 */
module.exports.update_enteteoperation = asyncHandler(async(req, res, next) => {
  try {
    const identeteoperation  = req.params.id;
    const enteteoperation_ = await enteteoperationservice.update_enteteoperation(identeteoperation, req.body);
    res.json({ success: true, data: enteteoperation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime une enteteoperation
 */
module.exports.delete_enteteoperation = asyncHandler(async(req, res, next) => {
  try {
    const identeteoperation = req.params.id;
    const enteteoperation_ = await enteteoperationservice.delete_enteteoperation(identeteoperation);
    res.json({ success: true, message: "entete operation supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
