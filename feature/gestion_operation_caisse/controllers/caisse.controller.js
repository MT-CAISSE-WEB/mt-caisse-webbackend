const caisseservice = require("../services/caisse.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste toutes les caisses
 */
module.exports.get_caisses = asyncHandler(async (req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const search = req.query.search || null;
    const limit = req.query.limit || null;
    const actif = req.query.actif || null;

    const caisses = await caisseservice.get_all_caisses({ page, limit, search, actif });
    res.json({ success: true, data: caisses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Une caisse existante par son id
 */
module.exports.get_onecaisse = asyncHandler(async (req, res, next) => {
  try {
    const idcaisse = req.params.id;
    const caisse_ = await caisseservice.get_by_idcaisse(idcaisse);
    res.json({ success: true, data: caisse_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée une nouvelle caisse
 */
module.exports.create_caisse = asyncHandler(async (req, res, next) => {
  try {
    const data = req.body;
    const new_caisse = await caisseservice.create_caisse(data);
    res.status(201).json({ success: true, data: new_caisse });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour une caisse existante
 */
module.exports.update_caisse = asyncHandler(async (req, res, next) => {
  try {
    const idcaisse = req.params.id;
    const caisse_ = await caisseservice.update_caisse(idcaisse, req.body);
    res.json({ success: true, data: caisse_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime une caisse
 */
module.exports.delete_caisse = asyncHandler(async (req, res, next) => {
  try {
    const idcaisse = req.params.id;
    const caisse_ = await caisseservice.delete_caisse(idcaisse);
    res.json({ success: true, message: "caisse supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Get solde caisse
 */
module.exports.getSolde = asyncHandler(async (req, res, next) => {
  try {
    const caisse_ = await caisseservice.getSolde();
    res.json({ success: true, data: caisse_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
