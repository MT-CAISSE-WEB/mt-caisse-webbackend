const affectationdepartementnaturemodel = require("../models/affectationdeptnature.model");
const { v4: uuidv4 } = require('uuid');
const sql = require("mssql");

let affectation = new affectationdepartementnaturemodel();

async function getAllNatures(iddepartement) {
  if (!iddepartement) {
    throw new Error("Ce département n'existe pas.");
  }

  try {
    const affectation_ = await affectation.getallNatures(iddepartement);
    return affectation_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


async function saveAffectations(iddepartement, idsNatures) {

  try {
    const affectation_ = await affectation.saveAffectations(iddepartement, idsNatures);
    return affectation_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


module.exports = {
  getAllNatures,
  saveAffectations
};
