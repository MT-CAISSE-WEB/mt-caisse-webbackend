const asyncHandler =require('../../../shared/middlewares/async')
const ErrorResponse = require('../../../shared/utils/errorResponse');
const departementservice = require ("../services/departement.service");

module.exports.getalldepartement = asyncHandler (async(req,res, next)=>{
    try {
        const departements = await departementservice.getalldepartement();
        res.status(departements.status).json({success:departements.success,
            message:departements.message, 
            data:departements.data});
    } catch (error) {
        res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});

module.exports.getonedepartement = asyncHandler (async(req,res, next)=>{
    try {
        const iddepartement = req.params.id
        const departement = await departementservice.getonedepartement(iddepartement);
         res.status(departement.status).json({success:departement.success,message:departement.message,data:departement.data});
        
    } catch (error) {
         res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});

module.exports.upsertdepartement = asyncHandler (async(req,res, next)=>{
    try {
        const {idsociete,idsite,responsable,codedept,libelle,email,telephone,adresse,createdby,updatedby} = req.body;
        const upsertdepartement = await departementservice.upsertdepartement({idsociete,idsite,responsable,codedept,libelle,email,telephone,adresse,createdby,updatedby})
        res.status(upsertdepartement.status).json({success: upsertdepartement.success,message:upsertdepartement.message, data: upsertdepartement.data});
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }
});

module.exports.deletedepartement = asyncHandler (async(req,res, next)=>{
    try {
        const iddepartement = req.params.id;   
        const deletedept = await departementservice.deletedepartement(iddepartement);
        res.status(deletedept.status).json({ success:deletedept.success,message:deletedept.message});
    } catch (error) {       
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }           
});
