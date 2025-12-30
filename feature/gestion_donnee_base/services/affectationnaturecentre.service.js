const affectationnaturecentremodel = require("../models/affectationnaturecentre.model");
const { v4: uuidv4 } = require('uuid');
const sql = require("mssql");
// const connectDB = require("../config/db");


let affectation = new affectationnaturecentremodel();

async function getAllCentres(idnature) {
  if (!idnature) {
    throw new Error("Cette nature n'existe pas.");
  }

  try {
    const affectation_ = await affectation.getallCentres(idnature);
    return affectation_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


async function saveAffectations(idnature, idsCentres) {

  try {
    const affectation_ = await affectation.saveAffectations(idnature, idsCentres);
    return affectation_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


module.exports = {
  getAllCentres,
  saveAffectations
};
