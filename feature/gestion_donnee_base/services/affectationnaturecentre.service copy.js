const affectationnaturecentremodel = require("../models/affectationnaturecentre.model");
const { v4: uuidv4 } = require('uuid');
const sql = require("mssql");
// const connectDB = require("../config/db");


let affectation = new affectationnaturecentremodel();

async function getCentresNonAffectes(idnature) {
  if (!idnature) {
    throw new Error("Cette nature n'existe pas.");
  }

  try {
    const affectation_ = await affectation.getCentresNonAffectes(idnature);
    return affectation_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


async function getCentresAffectees(idnature) {
  if (!idnature) {
    throw new Error("Cette nature n'existe pas.");
  }

  try {
    const affectation_ = await affectation.getCentresAffectees(idnature);
    return affectation_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


// async function saveAffectations(idnature, centres) {

//   const today = new Date();

//   const newaffectations = new affectationnaturecentremodel(
//     uuidv4(), 
//     idnature,
//     centres.idcentreanalytique,
//     centres.idsociete,
//     centres.createdat || today, 
//     centres.updatedat || null, 
//     centres.createdby || 'System',
//     centres.updatedby || null);

//   const recorded = await newaffectations.saveAffectations(newaffectations);
//   // si le modèle renvoie une erreur
//   if (!recorded.success) {
//     throw new Error(recorded.message);
//   }
//   return recorded.data;
// }


module.exports = {
  getCentresNonAffectes,
  getCentresAffectees,
  // saveAffectations
};
