const centreanalytiqueservice = require("../services/centreanalytique.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste tous les centres analytiques
 */
// OK
module.exports.get_allcentres = asyncHandler(async(req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const centres = await centreanalytiqueservice.get_allcentres(page, limit);
    res.json({ success: true, data: centres });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});


/**
 * Un centre existant par son id
 */ 
// OK
module.exports.get_onecentre = asyncHandler(async(req, res, next) => {
  try {
    const idcentre  = req.params.idcentre;
    const centre_ = await centreanalytiqueservice.get_by_idcentre(idcentre);
    res.json({ success: true, data: centre_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


/**
 * Crée un nouveau centre
 */
module.exports.create_centre = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_centre = await centreanalytiqueservice.create_centre(data);
    res.status(201).json({ success: true, data: new_centre });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


/**
 * Met à jour un centre existant
 */
module.exports.update_centre = asyncHandler(async(req, res, next) => {
  try {
    const idcentre  = req.params.idcentre;
    const centre_ = await centreanalytiqueservice.update_centre(idcentre, req.body);
    res.json({ success: true, data: centre_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});



/**
 * Supprime un centre
 */
module.exports.delete_centre = asyncHandler(async(req, res, next) => {
  try {
    const idcentre = req.params.idcentre;
    const centre_ = await centreanalytiqueservice.delete_centre(idcentre);
    res.json({ success: true, message: "Centre analytique supprimé avec succès." });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
