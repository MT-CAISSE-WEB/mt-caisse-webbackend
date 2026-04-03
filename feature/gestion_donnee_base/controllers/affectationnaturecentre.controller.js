const affectationnaturecentre = require("../services/affectationnaturecentre.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");


// Récupère les centres non affectés à une nature
module.exports.getallCentres = asyncHandler(async(req, res, next) => {
  try {
    const idnature  = req.params.idnature;
    const centres = await affectationnaturecentre.getAllCentres(idnature);
    res.json({ success: true, data: centres });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


// Sauvegarde les affectations des centres à une nature
module.exports.saveAffectations = asyncHandler(async(req, res, next) => {
  try {
    const idnature  = req.params.idnature;
    const idsCentres  = req.body;
    const affectation_ = await affectationnaturecentre.saveAffectations(idnature, idsCentres);
    res.json({ success: true, data: affectation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});