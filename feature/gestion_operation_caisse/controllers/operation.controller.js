const typeoperationservice = require("../services/operation.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste toutes les types operations
 */
module.exports.get_typeoperations = asyncHandler(async(req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const search = req.query.search || null;
    const date = req.query.date || null;
    const status = req.query.status || null;      // Comptabilisé / Non comptabilisé / Tous

    const typeoperations = await typeoperationservice.get_all_typeoperations({page,search,date,status});
    res.json({ success: true, data: typeoperations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Un type operation existante par son id
 */
module.exports.get_onetypeoperation = asyncHandler(async(req, res, next) => {
  try {
    const idtypeoperation  = req.params.id;
    const typeoperation_ = await typeoperationservice.get_by_idtypeoperation(idtypeoperation);
    res.json({ success: true, data: typeoperation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée une nouvelle operation
 */
module.exports.create_typeoperation = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_typeoperation = await typeoperationservice.create_typeoperation(data);
    res.status(201).json({ success: true, data: new_typeoperation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour une operation existante
 */
module.exports.update_typeoperation = asyncHandler(async(req, res, next) => {
  try {
    const idtypeoperation  = req.params.id;
    const typeoperation_ = await typeoperationservice.update_typeoperation(idtypeoperation, req.body);
    res.json({ success: true, data: typeoperation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime une operation
 */
module.exports.delete_typeoperation = asyncHandler(async(req, res, next) => {
  try {
    const idtypeoperation = req.params.id;
    const typeoperation_ = await typeoperationservice.delete_typeoperation(idtypeoperation);
    res.json({ success: true, message: "operation supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Get solde caisse
 */
module.exports.get_soldecaisse = asyncHandler(async(req, res, next) => {
  try {
    const typeoperation_ = await typeoperationservice.get_soldecaisse();
    res.json({ success: true, data: typeoperation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Get operation le plux couteux
 */
module.exports.get_operationmax = asyncHandler(async(req, res, next) => {
  try {
    const max_op = await typeoperationservice.get_operationmax();
    res.json({ success: true, data: max_op });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
