const circuitetapeservice = require("../services/circuitetape.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste tous les Worflow
 */
module.exports.get_circuitetapes = asyncHandler(async(req, res, next) => {
  try {
    const circuitetapes = await circuitetapeservice.get_all_circuitetape();
    res.json({ success: true, data: circuitetapes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 */
module.exports.get_onecircuitetape = asyncHandler(async(req, res, next) => {
  try {
    const idcircuitetape  = req.params.id;
    const circuitetape_ = await circuitetapeservice.get_onecircuitetape(idcircuitetape);
    res.json({ success: true, data: circuitetape_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée une nouveau circuit
 */
module.exports.create_circuitetape = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_circuitetape = await circuitetapeservice.create_circuitetape(data);
    res.status(201).json({ success: true, data: new_circuitetape });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour un Worflow existante
 */
module.exports.update_circuitetape = asyncHandler(async(req, res, next) => {
  try {
    const idcircuitetape  = req.params.id;
    const circuitetape_ = await circuitetapeservice.update_circuitetape(idcircuitetape, req.body);
    res.json({ success: true, data: circuitetape_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime un Worflow
 */
module.exports.delete_circuitetape = asyncHandler(async(req, res, next) => {
  try {
    const idcircuitetape = req.params.id;
    const circuitetape_ = await circuitetapeservice.delete_circuitetape(idcircuitetape);
    res.json({ success: true, message: "Worflow supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
