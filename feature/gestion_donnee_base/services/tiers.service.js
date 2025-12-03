const tiersmodel = require("../models/tiers.model");
const { v4: uuidv4 } = require('uuid');
const PaginationModel = require("../../../shared/utils/model");

let tier = new tiersmodel();

let tiers = [];

// OK
async function get_all_tiers(page = 1, limit = 5) {
  const result = await tier.get_alltiers(page, limit);
  tiers = result.data.map(item => new tiersmodel(
    item.idtiers,
    item.codetiers, 
    item.designation,
    item.typetiers, 
    item.actif, 
    item.idsociete,
    item.createdat, 
    item.updatedat, 
    item.createdby, 
    item.updatedby));
  return new PaginationModel(result.page, result.limit, result.total, tiers);
}


// OK
async function create_tiers(data) {
  if (!data.codetiers || !data.designation || !data.typetiers || !data.actif || !data.idsociete) {
    throw new Error("Tous les champs sont requis.");
  }

  const today = new Date();

  const newtiers = new tiersmodel(
    uuidv4(), 
    data.codetiers, 
    data.designation,
    data.typetiers, 
    data.actif, 
    data.idsociete,
    data.createdat || today, 
    data.updatedat || null, 
    data.createdby || 'System',
    data.updatedby || null);

  const recorded = await newtiers.create_tiers(newtiers);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }
  return recorded.data;
}


// OK
async function get_by_idtiers(idtiers) {
  if (!idtiers) {
    throw new Error("Ce tiers n'existe pas.");
  }

  try {
    const tiers_ = await tier.get_onetiers(idtiers);
    return tiers_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


async function update_tiers(idtiers, data) {
  if (!idtiers) {
    throw new Error("Erreur de donnée");
  }

  try {
    const tiers_ = await tier.update_tiers(idtiers, data);
    return tiers_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
}


// OK
async function delete_tiers(idtiers) {
   try {
    const tiers_ = await tier.delete_tiers(idtiers);
    if (!tiers_.success) {
      throw new Error(tiers_.message);
    }
   } catch (err) {
    console.log(`Aucune donnée: ${err.message}`.cyan.bold);
    throw err;
   }
}


module.exports = {
  get_all_tiers,
  get_by_idtiers,
  create_tiers,
  update_tiers,
  delete_tiers
};
