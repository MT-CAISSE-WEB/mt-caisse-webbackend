const parametereservice = require("../services/parametrecomptable.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Get tous les paramètres comptables
 */
module.exports.getParametreComptable = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const params = await parametereservice.getall(data);
    res.json({ success: true, data: params });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});


/**
 * Save paramètre comptable */
module.exports.saveParametreComptable = asyncHandler(async(req, res, next) => {
  try {    
    const data = req.body;
    const parametre = await parametereservice.save(data);
    res.status(201).json({ success: true, data: parametre });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }         
});
