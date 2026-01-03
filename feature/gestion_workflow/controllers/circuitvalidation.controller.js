const circuitvalidationservice = require("../services/circuitvalidation.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste tous les Worflow
 */
module.exports.get_circuitvalidations = asyncHandler(async(req, res, next) => {
  try {
    const circuitvalidations = await circuitvalidationservice.get_all_circuitvalidation();
    res.json({ success: true, data: circuitvalidations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 */
module.exports.get_onecircuitvalidation = asyncHandler(async(req, res, next) => {
  try {
    const idcircuitvalidation  = req.params.id;
    const circuitvalidation_ = await circuitvalidationservice.get_onecircuitvalidation(idcircuitvalidation);
    res.json({ success: true, data: circuitvalidation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée une nouveau circuit
 */
module.exports.create_circuitvalidation = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_circuitvalidation = await circuitvalidationservice.create_circuitvalidation(data);
    res.status(201).json({ success: true, data: new_circuitvalidation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour un Worflow existante
 */
module.exports.update_circuitvalidation = asyncHandler(async(req, res, next) => {
  try {
    const idcircuitvalidation  = req.params.id;
    const circuitvalidation_ = await circuitvalidationservice.update_circuitvalidation(idcircuitvalidation, req.body);
    res.json({ success: true, data: circuitvalidation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime un Worflow
 */
module.exports.delete_circuitvalidation = asyncHandler(async(req, res, next) => {
  try {
    const idcircuitvalidation = req.params.id;
    const circuitvalidation_ = await circuitvalidationservice.delete_circuitvalidation(idcircuitvalidation);
    res.json({ success: true, message: "Worflow supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
