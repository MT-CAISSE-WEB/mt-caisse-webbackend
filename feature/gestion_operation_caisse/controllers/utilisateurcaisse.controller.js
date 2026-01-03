const utilisateurcaisseservice = require("../services/utilisateurcaisse.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste tous les utilisateur caisses
 */
module.exports.get_utilisateurcaisses = asyncHandler(async(req, res, next) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const search = req.query.search || null;
  const limit = req.query.limit || null;
  const actif = req.query.actif || null; 

  try {
    const utilisateurcaisses = await utilisateurcaisseservice.get_all_utilisateurcaisses({page, limit , search, actif});
    res.json({ success: true, data: utilisateurcaisses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Un utilisateur caisse existant par son id
 */
module.exports.get_oneutilisateurcaisse = asyncHandler(async(req, res, next) => {
  try {
    const idutilisateurcaisse  = req.params.id;
    const utilisateurcaisse_ = await utilisateurcaisseservice.get_by_idutilisateurcaisse(idutilisateurcaisse);
    res.json({ success: true, data: utilisateurcaisse_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Des caisses by user
 */
module.exports.get_caisseByUser = asyncHandler(async(req, res, next) => {
  try {
    const utilisateur  = req.params.id;
    const utilisateurcaisse_ = await utilisateurcaisseservice.get_caiiseByuser(utilisateur);
    res.json({ success: true, data: utilisateurcaisse_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée un nouveau utilisateurcaisse
 */
module.exports.create_utilisateurcaisse = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_utilisateurcaisse = await utilisateurcaisseservice.create_utilisateurcaisse(data);
    res.status(201).json({ success: true, data: new_utilisateurcaisse });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour un utilisateur caisse existante
 */
module.exports.update_utilisateurcaisse = asyncHandler(async(req, res, next) => {
  try {
    const idutilisateurcaisse  = req.params.id;
    const utilisateurcaisse_ = await utilisateurcaisseservice.update_utilisateurcaisse(idutilisateurcaisse, req.body);
    res.json({ success: true, data: utilisateurcaisse_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime un utilisateur caisse
 */
module.exports.delete_utilisateurcaisse = asyncHandler(async(req, res, next) => {
  try {
    const idutilisateurcaisse = req.params.id;
    const utilisateurcaisse_ = await utilisateurcaisseservice.delete_utilisateurcaisse(idutilisateurcaisse);
    res.json({ success: true, message: "Affectation utilisateur caisse supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
