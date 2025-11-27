const asyncHandler =require('../../../shared/middlewares/async')
const ErrorResponse = require('../../../shared/utils/errorResponse');
const tauxdeviseservice = require ("../services/tauxdevise.service");

module.exports.getalltauxdevises = asyncHandler (async(req,res, next)=>{
    try {
        const tauxdevises = await tauxdeviseservice.getalltauxdevises();
        res.status(tauxdevises.status).json({success:tauxdevises.success,message:tauxdevises.message,data:tauxdevises.data});
    } catch (error) {
        res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});

module.exports.getonetauxdevise = asyncHandler (async(req,res, next)=>{
    try {
        const idtauxdevise = req.params.id
        const tauxdevise = await tauxdeviseservice.getonetauxdevise(idtauxdevise);
         res.status(tauxdevise.status).json({success:tauxdevise.success,message:tauxdevise.message,data:tauxdevise.data});
        
    } catch (error) {
         res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});


module.exports.upserttauxdevise = asyncHandler (async(req,res, next)=>{
    try {
        const {iddeviseorigine,iddevisedestination,codetauxdevise,intitule,typecours,datecours,coefficient,coefficientinverse,createdby,updatedby} = req.body;
        const upserttauxdevise = await tauxdeviseservice.upserttauxdevise({iddeviseorigine,iddevisedestination,codetauxdevise,intitule,typecours,datecours,coefficient,coefficientinverse,createdby,updatedby})
        res.status(upserttauxdevise.status).json({success: upserttauxdevise.success,message:upserttauxdevise.message, data: upserttauxdevise.data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }
});

module.exports.deletetauxdevise = asyncHandler (async(req,res, next)=>{
    try {
        const idtauxdevise = req.params.id;   
        const deletedtauxdevise = await tauxdeviseservice.deletetauxdevise(idtauxdevise);
        res.status(deletedtauxdevise.status).json({ success:deletedtauxdevise.success,message:deletedtauxdevise.message});
    } catch (error) {       
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }           
});

