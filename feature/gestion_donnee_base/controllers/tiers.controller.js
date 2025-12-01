const tiersservice = require("../services/tiers.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste toutes les tiers OK
 */
module.exports.get_tiers = asyncHandler(async(req, res, next) => {
  try {
    const tiers = await tiersservice.get_all_tiers();
    res.json({ data: tiers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Un tiers existant par son id
 */ 
// OK
module.exports.get_onetiers = asyncHandler(async(req, res, next) => {
  try {
    const idtiers  = req.params.idtiers;
    const tiers_ = await tiersservice.get_by_idtiers(idtiers);
    res.json({ data: tiers_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


/**
 * Crée un nouveau tiers
 */
module.exports.create_tiers = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_tiers = await tiersservice.create_tiers(data);
    res.status(201).json({ data: new_tiers });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


/**
 * Met à jour un tiers existant
 */
module.exports.update_tiers = asyncHandler(async(req, res, next) => {
  try {
    const idtiers  = req.params.idtiers;
    const tiers_ = await tiersservice.update_tiers(idtiers, req.body);
    res.json({ data: tiers_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


/**
 * Supprime un tiers
 */
module.exports.delete_tiers = asyncHandler(async(req, res, next) => {
  try {
    const idtiers = req.params.idtiers;
    const tiers_ = await tiersservice.delete_tiers(idtiers);
    res.json({ message: "Tiers supprimé avec succès." });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
