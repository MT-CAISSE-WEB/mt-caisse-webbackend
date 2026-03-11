const suivibudgetservice = require('../services/suivibudget.service.js')
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Crée un nouveau demande
 */
module.exports.suivibudgetController = asyncHandler(async(req, res, next) => {
  try {
    const result = await suivibudgetservice.suivibudget();
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


module.exports.suiviByFiltreController = asyncHandler(async(req, res, next) => {
  try {
    const {datedebut, datefin, nature, departement} = req.body;
    
    const result = await suivibudgetservice.suiviByFiltre(datedebut, datefin, nature, departement);
    // console.log(result)
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.log(error)
    res.status(400).json({ success: false, message: error.message });
  }
});