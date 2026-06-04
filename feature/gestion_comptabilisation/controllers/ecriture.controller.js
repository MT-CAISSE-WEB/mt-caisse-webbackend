const asyncHandler =require('../../../shared/middlewares/async')
const ErrorResponse = require('../../../shared/utils/errorResponse');
const ecritureservice = require ("../services/ecriture.service");

module.exports.GenererEcriture = asyncHandler (async(req,res, next)=>{
    try {
         const { idoperation } = req.params;
         const result = await ecritureservice.GenererEcriture(idoperation);

            if (!result.success) {  
                return res.status(400).json(result);
            }
        res.status(200).json({success:true,message:"Écriture générée avec succès",data:result});
    } catch (error) {
        res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});

module.exports.GenererJustificatif = asyncHandler (async(req,res, next)=>{
    try {
         const { idjustificatif } = req.params;
         const result = await ecritureservice.GenererJustificatif(idjustificatif);  

            if (!result.success) {  
                return res.status(400).json(result);
            }
        res.status(200).json({success:true,message:"Justificatif généré avec succès",data:result});
    } catch (error) {
        res.status(500).json({success:false, message:"Erreur serveur", error});
    }

});
