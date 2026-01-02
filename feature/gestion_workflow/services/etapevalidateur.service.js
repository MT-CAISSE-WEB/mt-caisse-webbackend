const etapevalidateurmodel = require("../models/etapevalidateur.model");
const { v4: uuidv4 } = require('uuid');

let etapevalidateur = new etapevalidateurmodel();
let etapevalidateurs = [];

async function get_all_etapevalidateur() {
  const result = await etapevalidateur.get_alletapevalidateur();
  etapevalidateurs = result.recordset.map(item => new etapevalidateurmodel(
    item.idcircuitetape,
    item.idutilisateur, 
    item.createdat,  
    item.createdby,
    item.updatedat, 
    item.updatedby
  ));

 
  return etapevalidateurs;
}


async function create_etapevalidateur(data) {

  const today = new Date();

  const newetapevalidateur = new etapevalidateurmodel(
    uuidv4(),
    data.idcircuitetape,
    data.idutilisateur,
    data.createdat || today,
    data.createdby || 'System'
  );

  const recorded = await newetapevalidateur.create_etapevalidateurmodel();

  if (!recorded.success) throw new Error(recorded.message);

  return recorded;
}


async function get_oneetapevalidateur(idcircuitetape,idutilisateur) {
  if (!idcircuitetape) {
    throw new Error("Erreur de donnée");
  }

  try {
    const etapevalidateur_ = await etapevalidateur.get_oneetapevalidateur(idcircuitetape,idutilisateur);
    return etapevalidateur_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function update_etapevalidateur(idcircuitetape,idutilisateur) {
  if (!idcircuitetape || !idutilisateur) {
    throw new Error("Erreur de donnée");
  }

  try {
    const etapevalidateur_ = await etapevalidateur.update_etapevalidateur(idcircuitetape,idutilisateur);
    return etapevalidateur_;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function delete_etapevalidateur(idcircuitetape,idutilisateur) {
   try {
    const etapevalidateur_ = await etapevalidateur.delete_etapevalidateur(idcircuitetape,idutilisateur);
    if (!etapevalidateur_.success) {
      throw new Error(etapevalidateur_.message);
    }
    return etapevalidateur_;
   } catch (err) {
    throw err;
   }
}

module.exports = {
  get_all_etapevalidateur,
  get_oneetapevalidateur,
  create_etapevalidateur,
  update_etapevalidateur,
  delete_etapevalidateur
};