const departementservice = require("../services/departement.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste toutes les departements
 */
module.exports.get_departements = asyncHandler(async(req, res, next) => {
  try {
    const departements = await departementservice.get_all_departements();
    res.json({ data: departements });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});


/**
 * Une departement existant par son id
 */
module.exports.get_onedepartement = asyncHandler(async(req, res, next) => {
  try {
    const iddepartement  = req.params.id;
    const departement_ = await departementservice.get_onedepartement(iddepartement);
    res.json({ data: departement_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée une nouvelle departement
 */
module.exports.create_departement = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_departement = await departementservice.create_departement(data);
    res.status(201).json({ data: new_departement });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour une departement existante
 */
module.exports.update_departement = asyncHandler(async(req, res, next) => {
  try {
    const iddepartement  = req.params.id;
    const departement_ = await departementservice.update_departement(iddepartement, req.body);
    res.json({ data: departement_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime une departement
 */
module.exports.delete_departement = asyncHandler(async(req, res, next) => {
  try {
    const iddepartement = req.params.id;
    const departement_ = await departementservice.delete_departement(iddepartement);
    res.json({ message: "departement supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
