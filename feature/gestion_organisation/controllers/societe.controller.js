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
});
