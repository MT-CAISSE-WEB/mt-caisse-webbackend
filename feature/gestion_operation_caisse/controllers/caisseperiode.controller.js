const caisseperiodeservice = require("../services/caisseperiode.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste toutes les périodes caisses
 */
module.exports.get_caisseperiodes = asyncHandler(async(req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const caisses = await caisseperiodeservice.get_all_caisseperiodes(page);
    res.json({ success: true, data: caisses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Une periode caisse existante par son id
 */
module.exports.get_onecaisseperiode = asyncHandler(async(req, res, next) => {
  try {
    const idperiode  = req.params.id;
    const periode_ = await caisseperiodeservice.get_by_idperiode(idperiode);
    res.json({ success: true, data: periode_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée une nouvelle période caisse
 */
module.exports.create_caisse = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_caisse = await caisseperiodeservice.create_caisseperiode(data);
    res.status(201).json({ success: true, data: new_caisse });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour une periode caisse existante
 */
module.exports.update_caisseperiode = asyncHandler(async(req, res, next) => {
  try {
    const idperiode  = req.params.id;
    const periode_ = await caisseperiodeservice.update_caisseperiode(idperiode, req.body);
    res.json({ success: true, data: periode_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime une periode caisse
 */
module.exports.delete_caisseperiode = asyncHandler(async(req, res, next) => {
  try {
    const idperiode = req.params.id;
    const caisse_ = await caisseperiodeservice.delete_caisse(idperiode);
    res.json({ success: true, message: "caisse supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Fermeture une periode caisse existante
 */
module.exports.fermeture_caisse = asyncHandler(async(req, res, next) => {
  try {
    const idutilisateur  = req.params.id;
    const periode_ = await caisseperiodeservice.fermeture_periode(idutilisateur, req.body);
    res.json({ success: true, data: periode_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Billetage période caisse
 */
module.exports.create_billetage = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_caisse = await caisseperiodeservice.create_caisseBilletage(data);
    res.status(201).json({ success: true, data: new_caisse });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Validation une periode caisse existante
 */
module.exports.validate_caisse = asyncHandler(async(req, res, next) => {
  try {
    const idperiode  = req.params.id;
    const periode_ = await caisseperiodeservice.validate_periode(idperiode, req.body);
    res.json({ success: true, data: periode_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Ouverture une periode caisse existante
 */
module.exports.open_caisse = asyncHandler(async(req, res, next) => {
  try {
    const idutilisateur  = req.params.id;
    const periode_ = await caisseperiodeservice.open_periode(idutilisateur, req.body);
    res.json({ success: true, data: periode_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Une periode caisse existante par son id
 */
module.exports.get_recentperiode = asyncHandler(async(req, res, next) => {
  try {
    const idcaisse  = req.params.id;
    const periode_ = await caisseperiodeservice.get_recentperiode(idcaisse);
    res.json({ success: true, data: periode_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Validation une periode caisse existante
 */
module.exports.recalculate_solde = asyncHandler(async(req, res, next) => {
  try {
    const data  = req.body;
    const solde_ = await caisseperiodeservice.recalculate_solde(data);
    res.json({ success: true, data: solde_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


module.exports.get_caisse_tresorerie_by_date = asyncHandler(async(req, res, next) => {
  try {
    const { startDate, endDate, idcaisse } = req.body;
    const data = await caisseperiodeservice.get_caisse_tresorerie_by_date(startDate, endDate, idcaisse);
    res.json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
