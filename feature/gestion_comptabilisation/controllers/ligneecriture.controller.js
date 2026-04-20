const asyncHandler =require('../../../shared/middlewares/async')
const ErrorResponse = require('../../../shared/utils/errorResponse');
const ligneecritureservice = require ("../services/ligneecriture.service");

module.exports.getallLigneEcriture = asyncHandler (async(req,res, next)=>{
    try {
         const result = await ligneecritureservice.getallLigneEcriture();
         res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});