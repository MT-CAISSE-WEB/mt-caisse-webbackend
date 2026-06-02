const asyncHandler =require('../../../shared/middlewares/async')
const ErrorResponse = require('../../../shared/utils/errorResponse');
const utilisateur_roleservice = require ("../services/utilisateur_role.service");

module.exports.getallutilisateurrole = asyncHandler (async(req,res, next)=>{
    try {
        const utilisateursrole = await utilisateur_roleservice.getAllutilisateurrole();
        res.status(utilisateursrole.status).json({success:utilisateursrole.success,message:utilisateursrole.message,data:utilisateursrole.data});
    } catch (error) {
        res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});

module.exports.getutilisateursroles = asyncHandler (async(req,res, next)=>{
    try {
         const idutilisateur = req.params['id'];
         console.log("idutilisateur", idutilisateur);
         const utilisateursrole = await utilisateur_roleservice.getutilisateurrole(idutilisateur);
         res.status(utilisateursrole.status).json({success:utilisateursrole.success,message:utilisateursrole.message,data:utilisateursrole.data});
    } catch (error) {
        res.status(500).json({success:false, message:"Erreur serveur", error}); 
    }
});

module.exports.upsertutilisateurrole = asyncHandler (async(req,res, next)=>{
    try {
        const {idutilisateur,idrole, createdby, updatedby} = req.body;
        const upsertutilisateurrole = await utilisateur_roleservice.upsertutilisateurrole({idutilisateur,idrole,createdby, updatedby});
        res.status( upsertutilisateurrole.status).json({success:  upsertutilisateurrole.success,message: upsertutilisateurrole.message, data: upsertutilisateurrole.data});
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }   
});

module.exports.deleteutilisateurrole = asyncHandler (async(req,res, next)=>{
    try {
        const {idutilisateur,idrole} = req.params;
        const deleteutilisateurrole = await utilisateur_roleservice.deleteutilisateurrole(idutilisateur,idrole)
        res.status(deleteutilisateurrole.status).json({ success:deleteutilisateurrole.success,message:deleteutilisateurrole.message});
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }   
});