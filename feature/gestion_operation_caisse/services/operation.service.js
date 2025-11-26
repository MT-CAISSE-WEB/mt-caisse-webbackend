const typeoperationmodel = require("../models/operation.model");
const { v4: uuidv4 } = require('uuid');

let typeoperation = new typeoperationmodel();
let typeoperations = [];

async function get_all_typeoperations() {
  const result = await typeoperation.get_alltypeoperations();
  typeoperations = result.recordset.map(item => new typeoperationmodel(
    item.idtypeoperation,
    item.idoperation, 
    item.codeoperation, 
    item.idsociete,
    item.codesociete, 
    item.idsite,
    item.codesite,
    item.idcaisse,
    item.codecaisse, 
    item.montant, 
    item.createdat, 
    item.createdby, 
    item.updatedat,  
    item.updatedby));
  return typeoperations;
}

async function create_typeoperation(data) {
  if (!data.idoperation || !data.idnature) {
    throw new Error("Tous les champs (codeoperation, codenature) sont requis.");
  }

  const today = new Date();
  const newtypeoperation = new typeoperationmodel(
    uuidv4(),   
    data.idoperation, 
    data.codeoperation, 
    data.idsociete,
    data.codesociete, 
    data.idsite,
    data.codesite,
    data.idcaisse,
    data.codecaisse, 
    data.montant,
    data.createdat || today,
    data.createdby || today, 
    data.updatedat || 'System', 
    data.updatedby || 'System');
  const recorded = await newtypeoperation.create_typeoperationmodel(newtypeoperation);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }

  return recorded;
}

async function get_by_idtypeoperation(idtypeoperation) {
  if (!idtypeoperation) {
    throw new Error("Erreur de donnée");
  }

  try {
    const typeoperation_ = await typeoperation.get_onetypeoperation(idtypeoperation);
    return typeoperation_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function update_typeoperation(idtypeoperation, data) {
  if (!idtypeoperation || !data.idsite) {
    throw new Error("Erreur de donnée");
  }

  try {
    const typeoperation_ = await typeoperation.update(data.codetypeoperation, data);
    return typeoperation_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function delete_typeoperation(idtypeoperation) {
   try {
    const typeoperation_ = await typeoperation.delete_typeoperation(idtypeoperation);
    if (!typeoperation_.success) {
      throw new Error(typeoperation_.message);
    }
    return typeoperation_;
   } catch (err) {
    throw err;
   }
}

module.exports = {
  get_all_typeoperations,
  get_by_idtypeoperation,
  create_typeoperation,
  update_typeoperation,
  delete_typeoperation
};
