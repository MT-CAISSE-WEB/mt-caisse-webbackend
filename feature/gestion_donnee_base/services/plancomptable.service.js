const plancomptablemodel = require("../models/plancomptable.model");
const { v4: uuidv4 } = require('uuid');
const PaginationModel = require("../../../shared/utils/model");


let compte = new plancomptablemodel();

let comptes = []; 

async function get_all_comptes(page = 1, limit = 5) {
    const result = await compte.get_allcomptes(page, limit);
    comptes = result.data.map(item => new plancomptablemodel(
    item.idcompte,
    item.numcompte,
    item.libelle,
    item.ventillable,
    item.auxiliaire,
    item.actif,
    item.suivibudgetaire,
    item.suivibudgetairemensuel,
    item.idsociete,
    item.createdat, 
    item.updatedat, 
    item.createdby, 
    item.updatedby));

    // console.log(comptes)
    
  return new PaginationModel(result.page, result.limit, result.total, comptes);
}

// OK
async function create_compte(data) {
  if (!data.numcompte || !data.libelle || !data.ventillable || !data.auxiliaire || 
    !data.actif || !data.suivibudgetaire || !data.suivibudgetairemensuel || !data.idsociete) {
    throw new Error("Tous les champs sont requis.");
  }

  const today = new Date();

  const newcompte = new plancomptablemodel(
    uuidv4(), 
    data.numcompte, 
    data.libelle, 
    data.ventillable, 
    data.auxiliaire, 
    data.actif, 
    data.suivibudgetaire, 
    data.suivibudgetairemensuel,
    data.idsociete,
    data.createdat || today, 
    data.updatedat || null, 
    data.createdby || 'System',
    data.updatedby || null);

  const recorded = await newcompte.create_compte(newcompte);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }
  return recorded.data;
}


// OK
async function get_by_idcompte(idcompte) {
  if (!idcompte) {
    throw new Error("Ce compte n'existe pas.");
  }

  try {
    const compte_ = await compte.get_onecompte(idcompte);
    return compte_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


async function update_compte(idcompte, data) {
  if (!idcompte) {
    throw new Error("Erreur de donnée");
  }

  try {
    const compte_ = await compte.update_compte(idcompte, data);
    return compte_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
}


async function delete_compte(idcompte) {
   try {
    const compte_ = await compte.delete_compte(idcompte);
    if (!compte_.success) {
      throw new Error(compte_.message);
    }
    return compte_;
   } catch (err) {
    console.log(`Aucune donnée: ${err.message}`.cyan.bold);
    throw err;
   }
}


module.exports = {
  get_all_comptes,
  get_by_idcompte,
  create_compte,
  update_compte,
  delete_compte
};
