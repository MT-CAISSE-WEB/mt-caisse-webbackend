const natureoperationmodel = require("../models/natureoperation.model");
const { v4: uuidv4 } = require('uuid');
const PaginationModel = require("../../../shared/utils/model");


let nature = new natureoperationmodel();

let natures = []; 

async function get_all_natures(page = 1, limit = 5) {
    const result = await nature.get_allnatures(page, limit);
    natures = result.data.map(item => new natureoperationmodel(
    item.idnature,
    item.codenature,
    item.libelle,
    item.avanceajustifier,
    item.imputationtiers,
    item.actif,
    item.demandedecaissement,
    item.idsociete,
    item.idcompte,
    item.createdat, 
    item.updatedat, 
    item.createdby, 
    item.updatedby));

  return new PaginationModel(result.page, result.limit, result.total, natures);

}


// OK
async function create_nature(data) {
  if (!data.codenature || !data.libelle || !data.idsociete || !data.idcompte) {
    return new Error("Tous les champs sont requis.");
  }

  const today = new Date();
  const newnature = new natureoperationmodel(
    uuidv4(), 
    data.codenature, 
    data.libelle, 
    data.avanceajustifier, 
    data.imputationtiers, 
    data.actif, 
    data.demandedecaissement,
    data.idsociete,
    data.idcompte,
    data.createdat || today, 
    data.updatedat || null, 
    data.createdby || 'System',
    data.updatedby || null);

  const recorded = await newnature.create_nature(newnature);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }
  return recorded.data;
}


// OK
async function get_by_idnature(idnature) {
  if (!idnature) {
    throw new Error("Ce compte n'existe pas.");
  }

  try {
    const nature_ = await nature.get_onenature(idnature);
    return nature_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


async function update_nature(idnature, data) {
  if (!idnature) {
    throw new Error("Erreur de donnée");
  }

  try {
    const nature_ = await nature.update_nature(idnature, data);
    return nature_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
}


async function delete_nature(idnature) {
   try {
    const nature_ = await nature.delete_nature(idnature);
    if (!nature_.success) {
      throw new Error(nature_.message);
    }
    return nature_;
   } catch (err) {
    console.log(`Aucune donnée: ${err.message}`.cyan.bold);
    throw err;
   }
}


module.exports = {
  get_all_natures,
  get_by_idnature,
  create_nature,
  update_nature,
  delete_nature
};
