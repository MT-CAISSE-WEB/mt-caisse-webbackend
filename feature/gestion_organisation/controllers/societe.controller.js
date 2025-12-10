<<<<<<< HEAD
<<<<<<< HEAD
const societeservice = require("../services/societe.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste toutes les societes
 */
module.exports.get_societes = asyncHandler(async(req, res, next) => {
  try {
    const societes = await societeservice.get_all_societes();
    res.json({ success: true, data: societes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Une societe existant par son id
 */
module.exports.get_onesociete = asyncHandler(async(req, res, next) => {
  try {
    const idsociete  = req.params.id;
    const societe_ = await societeservice.get_onesociete(idsociete);
    res.json({ success: true, data: societe_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée une nouvelle societe
 */
module.exports.create_societe = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_societe = await societeservice.create_societe(data);
    res.status(201).json({ success: true, data: new_societe });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour une societe existante
 */
module.exports.update_societe = asyncHandler(async(req, res, next) => {
  try {
    const idsociete  = req.params.id;
    const societe_ = await societeservice.update_societe(idsociete, req.body);
    res.json({ success: true, data: societe_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime une societe
 */
module.exports.delete_societe = asyncHandler(async(req, res, next) => {
  try {
    const idsociete = req.params.id;
    const societe_ = await societeservice.delete_societe(idsociete);
    res.json({ success: true, message: "Societe supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
=======
=======
>>>>>>> origin/richard
const asyncHandler =require('../../../shared/middlewares/async')
const ErrorResponse = require('../../../shared/utils/errorResponse');
const societeservice = require ("../services/societe.service");


module.exports.getallsocietes = asyncHandler (async(req,res, next)=>{
    try {
        const societes = await societeservice.getallsociete();
        res.status(societes.status).json({success:societes.success,message:societes.message,data:societes.data});
    } catch (error) {
        res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});


module.exports.getalldevises = asyncHandler (async(req,res, next)=>{
    try {
        const societes = await societeservice.getalldevisesactif();
        res.status(societes.status).json({success:societes.success,message:societes.message,data:societes.data});
    } catch (error) {
        res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});


module.exports.getonesociete = asyncHandler (async(req,res, next)=>{
    try {
        const idsociete = req.params.id
        const societe = await societeservice.getonesociete(idsociete);
         res.status(societe.status).json({success:societe.success,message:societe.message,data:societe.data});
        
    } catch (error) {
         res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});

module.exports.upsertsociete = asyncHandler (async(req,res, next)=>{
    try {
        const {codesociete,iddevisereference,iddevisereporting, raisonsociale,sigle, rccm, numnui, email, telephone, adresse, suivibudgetaire,createdby, updatedby } = req.body;
        
        let logoPath = null;
        if (req.file) {
            logoPath = `/uploads/logo/${req.file.filename}`;
        }
        
        const updatedsociete = await societeservice.upsertsociete({codesociete,iddevisereference,iddevisereporting, raisonsociale,sigle, rccm, numnui, email, telephone, logo: logoPath, adresse, suivibudgetaire,createdby, updatedby })
        res.status(updatedsociete.status).json({success: updatedsociete.success,message:updatedsociete.message, data: updatedsociete.data});
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }
});

module.exports.deletesociete = asyncHandler (async(req,res, next)=>{
    try {
        const idsociete = req.params.id;   
        const deletesociete = await societeservice.deletesociete(idsociete);
        res.status(deletesociete.status).json({ success:deletesociete.success,message:deletesociete.message});
    } catch (error) {       
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }           
<<<<<<< HEAD
>>>>>>> origin/junior
=======
>>>>>>> origin/richard
});
