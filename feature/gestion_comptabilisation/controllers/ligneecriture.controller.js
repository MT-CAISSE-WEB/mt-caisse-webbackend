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