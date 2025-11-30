const departementmodel = require("../models/departement.model");
const { v4: uuidv4 } = require('uuid');

let departement = new departementmodel();
let departements = [];

async function get_all_departements() {
  const result = await departement.get_alldepartements();
  departements = result.recordset.map(item => new departementmodel(
    item.iddepartement,
    item.codedepartement,
    item.libelle,
    item.email,
    item.telephone,
    item.adresse,
    item.idsociete,
    item.createdat,
    item.updatedat,
    item.createdby,
    item.updatedby));
  return departements;
}


async function create_departement(data) {
  if (!data.code && !data.raisonsociale && !data.rccm && !data.numNUI && !data.email
     && !data.telephone && !data.logo && !data.adresse && !data.suivibudgetaire) {
    throw new Error("Tous les champs sont requis.");
  }

  const today = new Date();
  const newdepartement = new departementmodel(
    uuidv4(), 
    data.code, 
    data.raisonsociale, 
    data.rccm, 
    data.numNUI, 
    data.email, 
    data.telephone, 
    data.logo, 
    data.adresse, 
    data.suivibudgetaire, 
    data.createdAt || today, 
    data.updatedAt || today, 
    data.createdBy || 'System', 
    data.updatedBy || 'System');
  const recorded = await newdepartement.create_departementmodel(newdepartement);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }

  return recorded;
}

async function get_by_iddepartement(iddepartement) {
  if (!iddepartement) {
    throw new Error("Société non trouvée.");
  }
  
  try {
    const departement_ = await departement.get_onedepartement(iddepartement);
    return departement_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function update_departement(iddepartement, data) {
  if (!iddepartement) {
    throw new Error("Erreur de donnée");
  }

  try {
    const departement_ = await departement.update_departement(data.iddepartement, data);
    return departement_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function delete_departement(iddepartement) {
   try {
    const departement_ = await departement.delete_departement(iddepartement);
    if (!departement_.success) {
      throw new Error(departement_.message);
    }
    return departement_;
   } catch (err) {
    throw err;
   }
}

module.exports = {
  get_all_departements,
  get_by_iddepartement,
  create_departement,
  update_departement,
  delete_departement
};
