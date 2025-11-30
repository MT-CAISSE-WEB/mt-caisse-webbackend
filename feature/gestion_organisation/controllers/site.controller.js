const siteservice = require("../services/site.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste toutes les sites
 */
module.exports.get_sites = asyncHandler(async(req, res, next) => {
  try {
    const sites = await siteservice.get_all_sites();
    res.json({ data: sites });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});


/**
 * Une site existant par son id
 */
module.exports.get_onesite = asyncHandler(async(req, res, next) => {
  try {
    const idsite  = req.params.id;
    const site_ = await siteservice.get_onesite(idsite);
    res.json({ data: site_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée une nouvelle site
 */
module.exports.create_site = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_site = await siteservice.create_site(data);
    res.status(201).json({ data: new_site });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour une site existante
 */
module.exports.update_site = asyncHandler(async(req, res, next) => {
  try {
    const idsite  = req.params.id;
    const site_ = await siteservice.update_site(idsite, req.body);
    res.json({ data: site_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime une site
 */
module.exports.delete_site = asyncHandler(async(req, res, next) => {
  try {
    const idsite = req.params.id;
    const site_ = await siteservice.delete_site(idsite);
    res.json({ message: "site supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
