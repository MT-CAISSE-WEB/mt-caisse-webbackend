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

module.exports.comptabiliserUnitaire = asyncHandler(async (req, res, next) => {
    const { idoperation } = req.body;
    if (!idoperation) {
        return res.status(400).json({ success: false, message: "idoperation requis" });
    }
    const result = await ecritureservice.comptabiliserOperations({ idoperation });
    res.status(200).json(result);
});


module.exports.comptabiliserMasse = asyncHandler(async (req, res, next) => {
    const { idsite, datedebut, datefin, journal } = req.body;
    const filters = {
        idsite: idsite || null,
        datedebut: datedebut || null,
        datefin: datefin || null
    };
    
    const result = await ecritureservice.comptabiliserOperations(filters);
    res.status(200).json(result);
});
