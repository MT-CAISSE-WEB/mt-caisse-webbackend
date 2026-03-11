const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");
const consultationservice = require('../services/operationConsultation.service')

/**
 * Get journal de paiement
 */
module.exports.journalPaiementController = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const result = await consultationservice.journalPaiement(data.datedebut, data.datefin, data.caisse);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Get detail operation
 */
module.exports.detailOperationController = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const result = await consultationservice.detailOperation(data);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});