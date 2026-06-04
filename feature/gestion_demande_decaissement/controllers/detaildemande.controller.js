const detaildemandeservice = require("../services/detaildemande.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");


/**
 * Supprime un deatil d'une ligne demande
 */
module.exports.delete = asyncHandler(async(req, res, next) => {
  try {
    const iddetail = req.params.id;
    const detail_ = await detaildemandeservice.delete_detaildemande(iddetail);
    res.json({ success: true, message: "Detail supprimé" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});