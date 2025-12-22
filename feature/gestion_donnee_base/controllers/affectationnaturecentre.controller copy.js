const affectationnaturecentre = require("../services/affectationnaturecentre.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");


// Récupère les centres non affectés à une nature
module.exports.getCentresNonAffectes = asyncHandler(async(req, res, next) => {
  try {
    const idnature  = req.params.idnature;
    const centres = await affectationnaturecentre.getCentresNonAffectes(idnature);
    res.json({ success: true, data: centres });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


// Récupère les centres affectés à une nature
module.exports.getCentresAffectees = asyncHandler(async(req, res, next) => {
  try {
    const idnature  = req.params.idnature;
    const centres = await affectationnaturecentre.getCentresAffectees(idnature);
    res.json({ success: true, data: centres });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});