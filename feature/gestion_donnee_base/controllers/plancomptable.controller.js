const plancomptableservice = require("../services/plancomptable.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste toutes les comptes OK
 */
module.exports.get_comptes = asyncHandler(async(req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const comptes = await plancomptableservice.get_all_comptes(page, limit);
    res.json({ success: true, data: comptes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Un compte existant par son id OK
 */ 
// OK
module.exports.get_onecompte = asyncHandler(async(req, res, next) => {
  try {
    const idcompte  = req.params.idcompte;
    const compte_ = await plancomptableservice.get_by_idcompte(idcompte);
    res.json({ success: true, data: compte_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


/**
 * Crée un nouveau compte
 */
module.exports.create_compte = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_compte = await plancomptableservice.create_compte(data);
    res.status(201).json({ success: true, data: new_compte });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


/**
 * Met à jour un compte existant OK
 */
module.exports.update_compte = asyncHandler(async(req, res, next) => {
  try {
    const idcompte  = req.params.idcompte;
    const compte_ = await plancomptableservice.update_compte(idcompte, req.body);
    res.json({ success: true, data: compte_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});



/**
 * Supprime un compte OK
 */
module.exports.delete_compte = asyncHandler(async(req, res, next) => {
  try {
    const idcompte = req.params.idcompte;
    const compte_ = await plancomptableservice.delete_compte(idcompte);
    res.json({ success: true, message: "Compte supprimé avec succès." });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
