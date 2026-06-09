const asyncHandler =require('../../../shared/middlewares/async')
const ErrorResponse = require('../../../shared/utils/errorResponse');
const ligneecritureservice = require ("../services/ligneecriture.service");

module.exports.getallLigneEcriture = asyncHandler (async(req,res, next)=>{
    try {
         const {idsite, datedebut, datefin, etat, journal,typeecriture} = req.body;
         const result = await ligneecritureservice.getallLigneEcriture(idsite, datedebut, datefin, etat, journal,typeecriture);
         res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

module.exports.comptabilisationEcriture = asyncHandler (async(req,res, next)=>{
    try {
         const {idoperation, idsite, datedebut, datefin, journal} = req.body;
         const result = await ligneecritureservice.comptabilisationEcriture(idoperation, idsite, datedebut, datefin, journal);
         res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});


module.exports.validerParIds = asyncHandler(async (req, res, next) => {
    const { ids } = req.body; // tableau d'UUID
    const result = await ligneecritureservice.validerParIds(ids);
    res.status(200).json(result);
});


module.exports.comptabiliserUnitaire = asyncHandler(async (req, res, next) => {
    const { idoperation } = req.body;
    if (!idoperation) {
        return res.status(400).json({ success: false, message: "idoperation requis" });
    }
    const result = await ligneecritureservice.comptabiliserOperations({ idoperation });
    res.status(200).json(result);
});


module.exports.comptabiliserMasse = asyncHandler(async (req, res, next) => {
    const { idsite, datedebut, datefin, journal } = req.body;
    const filters = {
        idsite: idsite || null,
        datedebut: datedebut || null,
        datefin: datefin || null,
        journal: journal || null
    };
    const result = await ligneecritureservice.comptabiliserOperations(filters);
    res.status(200).json(result);
});