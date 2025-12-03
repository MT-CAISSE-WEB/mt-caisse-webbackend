const affectationanalytiquemodel = require("../models/affectationanalytique.model");
const PaginationModel = require("../../../shared/utils/model");
const { v4: uuidv4 } = require('uuid');

let affectation = new affectationanalytiquemodel();

let affectations = []; 

async function get_all_affectations(page = 1, limit = 5) {
    const result = await affectation.get_allaffectations(page, limit);
    affectations = result.data.map(item => new affectationanalytiquemodel(
    item.idaffectation,
    item.codeaffectation,
    item.actif,
    item.idsociete,
    item.idsite,
    item.iddepartement,
    item.idcentreanalytique,
    item.idnature,
    item.createdat, 
    item.updatedat, 
    item.createdby, 
    item.updatedby));

  return new PaginationModel(result.page, result.limit, result.total, affectations);

}


// OK
async function create_affectation(data) {
  if ( !data.codeaffectation || !data.actif || !data.idsociete || !data.idsite || !data.iddepartement 
    || !data.idcentreanalytique || !data.idnature ) {
    throw new Error("Tous les champs sont requis.");
  }

  const today = new Date();

  const newaffectation = new affectationanalytiquemodel(
    uuidv4(),
    data.codeaffectation,
    data.actif, 
    data.idsociete,
    data.idsite,
    data.iddepartement,
    data.idcentreanalytique,
    data.idnature,
    data.createdat || today, 
    data.updatedat || null, 
    data.createdby || 'System',
    data.updatedby || null);

  const recorded = await newaffectation.create_affectation(newaffectation);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }
  return recorded.data;
}


// OK
async function get_by_idaffectation(idaffectation) {
  if (!idaffectation) {
    throw new Error("Cette affectation n'existe pas.");
  }

  try {
    const affectation_ = await affectation.get_oneaffectation(idaffectation);
    return affectation_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


async function update_affectation(idaffectation, data) {
  if (!idaffectation) {
    throw new Error("Erreur de donnée");
  }

  try {
    const affectation_ = await affectation.update_affectation(idaffectation, data);
    console.log(affectation_.recordset)
    return affectation_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
}


async function delete_affectation(idaffectation) {
   try {
    const affectation_ = await affectation.delete_affectation(idaffectation);
    if (!affectation_.success) {
      throw new Error(affectation_.message);
    }
    return affectation_;
   } catch (err) {
    console.log(`Aucune donnée: ${err.message}`.cyan.bold);
    throw err;
   }
}


module.exports = {
  get_all_affectations,
  get_by_idaffectation,
  create_affectation,
  update_affectation,
  delete_affectation
};
