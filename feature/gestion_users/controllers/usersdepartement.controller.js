const asyncHandler =require('../../../shared/middlewares/async')
const ErrorResponse = require('../../../shared/utils/errorResponse');
const utilisateurdeptservice = require ("../services/usersdepartement.service");

module.exports.getallutilisateurdept = asyncHandler (async(req,res, next)=>{
    try {
        const utilisateursdept = await utilisateurdeptservice.getAllutilisateurdept();
        res.status(utilisateursdept.status).json({success:utilisateursdept.success,message:utilisateursdept.message,data:utilisateursdept.data});
    } catch (error) {
        res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});

module.exports.getutilisateurdept = asyncHandler (async(req,res, next)=>{
    try {
         const idutilisateur = req.params['id'];
         const utilisateursdept = await utilisateurdeptservice.getutilisateurdepartement(idutilisateur);
         res.status(utilisateursdept.status).json({success:utilisateursdept.success,message:utilisateursdept.message,data:utilisateursdept.data});
    } catch (error) {
        res.status(500).json({success:false, message:"Erreur serveur", error}); 
    }
});

module.exports.upsertutilisateurdept = asyncHandler (async(req,res, next)=>{
    try {
        const {idutilisateur,iddepartement, createdby, updatedby} = req.body;
        const upsertutilisateurdept = await utilisateurdeptservice.upsertutilisateurdept({idutilisateur,iddepartement,createdby, updatedby});
        res.status(  upsertutilisateurdept.status).json({success:   upsertutilisateurdept.success,message:  upsertutilisateurdept.message, data: upsertutilisateurdept.data});
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }   
});

module.exports.deleteutilisateurdept = asyncHandler (async(req,res, next)=>{
    try {
        const {idutilisateur,iddepartement} = req.params;
        const deleteutilisateurdept = await utilisateurdeptservice.deleteutilisateurdept(idutilisateur,iddepartement)
        res.status(deleteutilisateurdept.status).json({ success:deleteutilisateurdept.success,message:deleteutilisateurdept.message});
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }   
});