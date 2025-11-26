const asyncHandler =require('../../../shared/middlewares/async')
const ErrorResponse = require('../../../shared/utils/errorResponse');
const deviseservice = require ("../services/devise.service");

module.exports.getalldevises = asyncHandler (async(req,res, next)=>{
    try {
        const devises = await deviseservice.getalldevises();
        res.status(devises.status).json({success:devises.success,message:devises.message,data:devises.data});
    } catch (error) {
        res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});

module.exports.getonedevise = asyncHandler (async(req,res, next)=>{
    try {
        const iddevise = req.params.id
        const devise = await deviseservice.getonedevise(iddevise);
         res.status(devise.status).json({success:devise.success,message:devise.message,data:devise.data});
        
    } catch (error) {
         res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});


module.exports.upsertdevise = asyncHandler (async(req,res, next)=>{
    try {
        const { code, intitule,codeiso,actif,updatedby } = req.body;
        const updateddevise = await deviseservice.upsertdevise({code,intitule,codeiso,actif,updatedby});
        res.status(updateddevise.status).json({success: updateddevise.success,message:updateddevise.message, data: updateddevise.data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }
});

module.exports.deletedevise = asyncHandler (async(req,res, next)=>{
    try {
        const iddevise = req.params.id;   
        const deleteddevise = await deviseservice.deletedevise(iddevise);
        res.status(deleteddevise.status).json({ success:deleteddevise.success,message:deleteddevise.message});
    } catch (error) {       
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }           
});
