const asyncHandler =require('../../../shared/middlewares/async')
const ErrorResponse = require('../../../shared/utils/errorResponse');
const siteservice = require ("../services/site.service");

module.exports.getallsites = asyncHandler (async(req,res, next)=>{
    try {
        const sites = await siteservice.getallsite();
        res.status(sites.status).json({success:sites.success,message:sites.message,data:sites.data});
    } catch (error) {
        res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});

module.exports.getonesite = asyncHandler (async(req,res, next)=>{
    try {
        const idsite = req.params.id
        const site = await siteservice.getonesite(idsite);
         res.status(site.status).json({success:site.success,message:site.message,data:site.data});
        
    } catch (error) {
         res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});

module.exports.upsertsite = asyncHandler (async(req,res, next)=>{
    try {
        const {idsociete,codesite,codeanalytique,libelle ,email,telephone,adresse,estcentreanalytique,createdby, updatedby } = req.body;
        const upsertsite = await siteservice.upsertsite({idsociete,codesite,codeanalytique,libelle ,email,telephone,adresse,estcentreanalytique,createdby, updatedby })
        res.status(upsertsite.status).json({success: upsertsite.success,message:upsertsite.message, data: upsertsite.data});
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }
});

module.exports.deletesite = asyncHandler (async(req,res, next)=>{
    try {
        const idsite = req.params.id;   
        const deletesite = await siteservice.deletesite(idsite);
        res.status(deletesite.status).json({ success:deletesite.success,message:deletesite.message});
    } catch (error) {       
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }           
});
