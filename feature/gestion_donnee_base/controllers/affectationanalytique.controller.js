const affectationanalytiqueservice = require("../services/affectationanalytique.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste tous les affectations analytiques
 */
// OK
module.exports.get_allaffectations = asyncHandler(async(req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const affectations = await affectationanalytiqueservice.get_all_affectations(page, limit);
    res.json({ success: true, data: affectations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Un affectation existant par son id
 */ 
// OK
module.exports.get_oneaffectation = asyncHandler(async(req, res, next) => {
  try {
    const idaffectation  = req.params.idaffectation;
    const affectation_ = await affectationanalytiqueservice.get_by_idaffectation(idaffectation);
    res.json({ success: true, data: affectation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


/**
 * Crée un nouveau affectation
 */
module.exports.create_affectation = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_affectation = await affectationanalytiqueservice.create_affectation(data);
    res.status(201).json({ success: true, data: new_affectation });
    // console.log(new_affectation);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


/**
 * Met à jour un affectation existant
 */
module.exports.update_affectation = asyncHandler(async(req, res, next) => {
  try {
    const idaffectation  = req.params.idaffectation;
    const affectation_ = await affectationanalytiqueservice.update_affectation(idaffectation, req.body);
    res.json({ success: true, data: affectation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});



/**
 * Supprime un affectation
 */
module.exports.delete_affectation = asyncHandler(async(req, res, next) => {
  try {
    const idaffectation = req.params.idaffectation;
    const affectation_ = await affectationanalytiqueservice.delete_affectation(idaffectation);
    res.json({ success: true, message: "Affectation supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
