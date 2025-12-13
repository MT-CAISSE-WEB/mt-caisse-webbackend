const utilisateurcaissemodel = require("../models/utilisateurcaisse.model");
const { v4: uuidv4 } = require('uuid');

let utilisateurcaisse = new utilisateurcaissemodel();
let utilisateurcaisses = [];

async function get_all_utilisateurcaisses() {
  const result = await utilisateurcaisse.get_allutilisateurcaisses();
  utilisateurcaisses = result.recordset.map(item => new utilisateurcaissemodel(
    item.idutilsateurcaisse,
    item.idcaisse, 
    item.codecaisse, 
    item.idutilisateur,
    item.codeutilisateur, 
    item.idsociete,
    item.codesociete,
    item.actif, 
    item.createdat, 
    item.createdby, 
    item.updatedat,  
    item.updatedby));
  return utilisateurcaisses;
}

async function create_utilisateurcaisse(data) {
  if (!data.idcaisse || !data.idutilisateur) {
    throw new Error("Tous les champs (codecaisse, codeutilisateur) sont requis.");
  }

  const today = new Date();
  const newutilisateurcaisse = new utilisateurcaissemodel(
    uuidv4(), 
    data.idcaisse,  
    data.codecaisse, 
    data.idutilisateur, 
    data.codeutilisateur,  
    data.idsociete,
    data.codesociete,  
    data.actif,
    data.createdat || today, 
    data.createdby || today, 
    data.updatedat || 'System', 
    data.updatedby || 'System');
  const recorded = await newutilisateurcaisse.create_utilisateurcaissemodel(newutilisateurcaisse);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }

  return recorded;
}

async function get_by_idutilisateurcaisse(idutilisateurcaisse) {
  if (!idutilisateurcaisse) {
    throw new Error("Erreur de donnée");
  }

  try {
    const utilisateurcaisse_ = await utilisateurcaisse.get_oneutilisateurcaisse(idutilisateurcaisse);
    return utilisateurcaisse_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function update_utilisateurcaisse(idutilisateurcaisse, data) {
  if (!idutilisateurcaisse || !data.idcaisse || !data.idutilisateur) {
    throw new Error("Erreur de donnée");
  }

  try {
    const utilisateurcaisse_ = await utilisateurcaisse.update(data.codeutilisateurcaisse, data);
    return utilisateurcaisse_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function delete_utilisateurcaisse(idutilisateurcaisse) {
   try {
    const utilisateurcaisse_ = await utilisateurcaisse.delete_utilisateurcaisse(idutilisateurcaisse);
    if (!utilisateurcaisse_.success) {
      throw new Error(utilisateurcaisse_.message);
    }
    return utilisateurcaisse_;
   } catch (err) {
    throw err;
   }
}

module.exports = {
  get_all_utilisateurcaisses,
  get_by_idutilisateurcaisse,
  create_utilisateurcaisse,
  update_utilisateurcaisse,
  delete_utilisateurcaisse
};
