const affectationdepartementnature = require("../services/affectationdeptnature.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");


// Récupère les natures non affectées à une nature
module.exports.getAllNatures = asyncHandler(async(req, res, next) => {
  try {
    const iddepartement  = req.params.iddepartement;
    const natures = await affectationdepartementnature.getAllNatures(iddepartement);
    res.json({ success: true, data: natures });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


// Sauvegarde les affectations des natures à une nature
module.exports.saveAffectations = asyncHandler(async(req, res, next) => {
  try {
    const iddepartement  = req.params.iddepartement;
    const idsNatures  = req.body;
    const affectation_ = await affectationdepartementnature.saveAffectations(iddepartement, idsNatures);
    res.json({ success: true, data: affectation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});