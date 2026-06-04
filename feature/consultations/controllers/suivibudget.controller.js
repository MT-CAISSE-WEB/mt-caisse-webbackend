const suivibudgetservice = require('../services/suivibudget.service.js')
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");
const budgetservice = require('../../gestion_budget/services/budget.service.js');

/**
 * Crée un nouveau demande
 */
module.exports.suivibudgetController = asyncHandler(async(req, res, next) => {
  try {
    const result = await suivibudgetservice.suivibudget();
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


module.exports.suiviByFiltreController = asyncHandler(async(req, res, next) => {
  try {
    const {datedebut, datefin, nature, departement} = req.body;
    const result = await suivibudgetservice.suiviByFiltre(datedebut, datefin, nature, departement);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.log(error)
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports.evolutionBudgetaire = asyncHandler(async(req, res, next) => {
  try {
    const {idnature, iddepartement, idbudget, centre, limit, page} = req.body;
    const budget = await budgetservice.get_budgetByid(req.body.idbudget);
    
    if(budget.isanalytique || budget.isanalytique == 0){
      console.log("evolutionBudgetaireBycentre".yellow.bold);
      const result = await suivibudgetservice.evolutionBudgetaireBycentre({idnature, iddepartement, idbudget, centre, limit, page});
      console.log(result)
      res.status(200).json({ success: true, data: result });
    } else {
      console.log("evolutionBudgetaireBynature".yellow.bold);
      const result = await suivibudgetservice.evolutionBudgetaireBynature({idnature, iddepartement, idbudget, centre, limit, page});
      console.log(result)
      res.status(200).json({ success: true, data: result });
    } 
  } catch (error) {
    console.log(error)
    res.status(400).json({ success: false, message: error.message });
  }
});