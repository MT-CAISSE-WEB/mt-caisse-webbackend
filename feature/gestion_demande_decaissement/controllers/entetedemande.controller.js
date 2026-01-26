const demandeservice = require("../services/entetedemande.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste toutes les demandes 
 */
module.exports.getAll = asyncHandler(async(req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const search = req.query.search || null;
    const limit =  req.query.limit ? parseInt(req.query.limit) : 10;
    const status = req.query.status || null;

    const demandes = await demandeservice.getAll({page, limit , search, status});
    res.json({ success: true, data: demandes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Un demande existant par son id
 */
module.exports.getById = asyncHandler(async(req, res, next) => {
  try {
    const iddemande  = req.params.id;
    const demande_ = await demandeservice.get_demande_by_id(iddemande);
    res.json({ success: true, data: demande_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée un nouveau demande
 */
module.exports.create = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_demande = await demandeservice.create_demande(data);
    res.status(201).json({ success: true, data: new_demande });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour une demande existante
 */
module.exports.update = asyncHandler(async(req, res, next) => {
  try {
    const iddemande  = req.params.id;
    const demande_ = await demandeservice.update_demande(iddemande, req.body);
    console.log(demande_);
    res.json({ success: true, data: demande_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime une demande
 */
module.exports.delete = asyncHandler(async(req, res, next) => {
  try {
    const iddemande = req.params.id;
    const demande_ = await demandeservice.delete_demande(iddemande);
    res.json({ success: true, message: "demande supprimé" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Validation d'une demande
 */
module.exports.validate = asyncHandler(async(req, res, next) => {
  try {
    const iddemande = req.params.id;
    const demande_ = await demandeservice.validate(iddemande, req.body);
    res.json({ success: true, data: demande_ , message: "Décision pris en compte" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Demande a valider
 */
module.exports.getDemandeAvalider = asyncHandler(async(req, res, next) => {
  try {
    const idutilisateur = req.params.id;
    const demande_ = await demandeservice.get_demandeAvalider(idutilisateur);
    res.json({ success: true, data: demande_, message: "Demande a valider" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Validateurs des demandes
 */
module.exports.getValidateursCircuit = asyncHandler(async(req, res, next) => {
  try {
    const iddemande = req.params.id;
    const demande_ = await demandeservice.get_validateurCircuit(iddemande);
    res.json({ success: true, data: demande_, message: "Validateurs du circuit" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Detail budget des demandes
 */
module.exports.getDetailBudget = asyncHandler(async(req, res, next) => {
  try {
    const iddemande = req.params.id;
    const demande_ = await demandeservice.get_detailBudget(iddemande);
    res.json({ success: true, data: demande_, message: "Details budget de la demande" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Dernier teux de devise
 */
module.exports.gettauxrecent = asyncHandler (async(req,res, next)=>{
    try {
        console.log(req.body);
        const {iddeviseorigine,iddevisedestination, datepiece} = req.body;
        const tauxrecents = await demandeservice.getDernierTaux(iddeviseorigine,iddevisedestination, datepiece);
        res.json({success: true, data: tauxrecents[0]});
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }
});