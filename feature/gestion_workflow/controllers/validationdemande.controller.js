const validationdemandeservice = require("../services/validationdemande.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste tous les Worflow
 */
module.exports.get_validationdemandes = asyncHandler(async(req, res, next) => {
  try {
    const validationdemandes = await validationdemandeservice.get_all_validationdemande();
    res.json({ success: true, data: validationdemandes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 */
module.exports.get_onevalidationdemande = asyncHandler(async(req, res, next) => {
  try {
    const idvalidationdemande  = req.params.id;
    const validationdemande_ = await validationdemandeservice.get_onevalidationdemande(idvalidationdemande);
    res.json({ success: true, data: validationdemande_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée une nouveau circuit
 */
module.exports.create_validationdemande = asyncHandler(async (req, res, next) => {
  try {
    const { iddemande, idsociete, datevalidation, createdby } = req.body;

    // Suppression de la vérification obligatoire
    // if (!iddemande) { ... }

    const validationdemande_ = await validationdemandeservice.create_validationdemande(req.body);

    res.json({
      success: true,
      message: "Demande de validation créée",
      data: validationdemande_
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour un Worflow existante
 */
module.exports.update_validationdemande = asyncHandler(async(req, res, next) => {
  try {
    const idvalidationdemande  = req.params.id;
    const validationdemande_ = await validationdemandeservice.update_validationdemande(idvalidationdemande, req.body);
    res.json({ success: true, data: validationdemande_ });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


/**
 * Supprime un Worflow
 */
module.exports.delete_validationdemande = asyncHandler(async(req, res, next) => {
  try {
    const idvalidationdemande = req.params.id;
    const validationdemande_ = await validationdemandeservice.delete_validationdemande(idvalidationdemande);
    res.json({ success: true, message: "Demande supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
