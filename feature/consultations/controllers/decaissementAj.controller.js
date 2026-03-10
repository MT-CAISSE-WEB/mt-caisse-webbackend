const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");
const consDecaissementAj = require('../services/decaissementaj.service')

/**
 * Consultation des décaissements à justifier
 */
module.exports.decaissementAjConsultation = asyncHandler(async(req, res, next) => {
  try {
    // const {typeoperation, codeoperation, datedebut, datefin} = req.body;
    const data = req.body;
    const result = await consDecaissementAj.getAllDecaissementAj(data);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});