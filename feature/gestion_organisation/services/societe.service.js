const societemodel = require("../models/societe.model");
const { v4: uuidv4 } = require('uuid');

let societe = new societemodel();
let societes = [];

async function get_all_societes() {
  const result = await societe.get_allsocietes();
  societes = result.recordset.map(item => new societemodel(
    item.idsociete,
    item.code, 
    item.raisonsociale, 
    item.rccm, 
    item.numNUI, 
    item.email, 
    item.telephone, 
    item.logo, 
    item.adresse, 
    item.suivibudgetaire, 
    item.createdAt, 
    item.updatedAt, 
    item.createdBy, 
    item.updatedBy));
  return societes;
}


async function create_societe(data) {
  if (!data.code && !data.raisonsociale && !data.rccm && !data.numNUI && !data.email
     && !data.telephone && !data.logo && !data.adresse && !data.suivibudgetaire) {
    throw new Error("Tous les champs sont requis.");
  }

  const today = new Date();
  const newsociete = new societemodel(
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
  const recorded = await newsociete.create_societemodel(newsociete);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }

  return recorded;
}

async function get_by_idsociete(idsociete) {
  if (!idsociete) {
    throw new Error("Société non trouvée.");
  }
  
  try {
    const societe_ = await societe.get_onesociete(idsociete);
    return societe_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function update_societe(idsociete, data) {
  if (!idsociete) {
    throw new Error("Erreur de donnée");
  }

  try {
    const societe_ = await societe.update_societe(data.idsociete, data);
    return societe_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function delete_societe(idsociete) {
   try {
    const societe_ = await societe.delete_societe(idsociete);
    if (!societe_.success) {
      throw new Error(societe_.message);
    }
    return societe_;
   } catch (err) {
    throw err;
   }
}

module.exports = {
  get_all_societes,
  get_by_idsociete,
  create_societe,
  update_societe,
  delete_societe
};
