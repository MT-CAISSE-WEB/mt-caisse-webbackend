const lignedemandeservice = require("../services/ligendemande.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");


/**
 * Supprime une ligne demande
 */
module.exports.delete = asyncHandler(async(req, res, next) => {
  try {
    const idligne = req.params.id;
    const ligne_ = await lignedemandeservice.delete_lignedemande(idligne);
    res.json({ success: true, message: "Detail supprimé" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});