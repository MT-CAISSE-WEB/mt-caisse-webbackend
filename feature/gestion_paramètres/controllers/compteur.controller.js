const compteurservice = require("../services/compteur.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste tous les compteurs
 */
module.exports.get_compteurs = asyncHandler(async(req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const search = req.query.search || null;
    const limit = req.query.limit || null;
    const actif = req.query.actif || null; 
    const compteurs = await compteurservice.getall({page, limit , search, actif});
    res.json({ success: true, data: compteurs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Un compteur existant par son id
 */
module.exports.get_onecompteur = asyncHandler(async(req, res, next) => {
  try {
    const idcompteur  = req.params.id;
    const compteur_ = await compteurservice.getOne(idcompteur);
    res.json({ success: true, data: compteur_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée un nouveau compteur
 */
module.exports.createcompteur = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const compteur = await compteurservice.create(data);
    res.status(201).json({ success: true, data: compteur });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour un compteur existante
 */
module.exports.update_compteur = asyncHandler(async(req, res, next) => {
  try {
    const idcompteur  = req.params.id;
    const compteur_ = await compteurservice.update(idcompteur, req.body);
    res.json({ success: true, data: compteur_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime un compteur
 */
module.exports.delete_compteur = asyncHandler(async(req, res, next) => {
  try {
    const idcompteur = req.params.id;
    const compteur_ = await compteurservice.delete_compteur(idcompteur);
    res.json({ success: true, message: "compteur supprimé" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
