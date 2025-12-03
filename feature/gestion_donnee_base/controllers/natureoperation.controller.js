const natureoperationservice = require("../services/natureoperation.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste toutes les natures d'opération OK
 */
// OK
module.exports.get_natures = asyncHandler(async(req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const natures = await natureoperationservice.get_all_natures(page, limit);
    res.json({ success: true, data: natures });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});


/**
 * Un nature existant par son id
 */ 
// OK
module.exports.get_onenature = asyncHandler(async(req, res, next) => {
  try {
    const idnature  = req.params.idnature;
    const nature_ = await natureoperationservice.get_by_idnature(idnature);
    res.json({ success: true, data: nature_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


/**
 * Crée un nouveau nature
 */
module.exports.create_nature = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    // console.log(data);
    const new_nature = await natureoperationservice.create_nature(data);
    res.status(201).json({ success: true, data: new_nature });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


/**
 * Met à jour un nature existant
 */
module.exports.update_nature = asyncHandler(async(req, res, next) => {
  try {
    const idnature  = req.params.idnature;
    const nature_ = await natureoperationservice.update_nature(idnature, req.body);
    res.json({ success: true, data: nature_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});



/**
 * Supprime un nature
 */
module.exports.delete_nature = asyncHandler(async(req, res, next) => {
  try {
    const idnature = req.params.idnature;
    const nature_ = await natureoperationservice.delete_nature(idnature);
    res.json({ success: true, message: "Nature supprimée avec succès." });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
