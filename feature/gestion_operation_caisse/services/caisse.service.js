const caissemodel = require("../models/caisse.model");
const journalmodel = require("../models/journal.model");
const { v4: uuidv4 } = require('uuid');

let caisse = new caissemodel();
let journal= new journalmodel();
let caisses = [];

async function get_all_caisses() {
  const result = await caisse.get_allcaisses();
  caisses = result.recordset.map(item => new caissemodel(
    item.idcaisse,
    item.codecaisse, 
    item.libelle, 
    item.idjournal, 
    item.codejournal, 
    item.iddevise, 
    item.codedevise, 
    item.idsite, 
    item.codesite, 
    item.idsociete, 
    item.codesociete, 
    item.idcompte, 
    item.numcompte,
    item.actif, 
    item.createdat, 
    item.createdby, 
    item.updatedat,  
    item.updatedby));
  return caisses;
}

async function create_caisse(data) {
  //Recuperer la societe de l'utilisateur connecté si societe n'est pas renseigné

  // Verifier si societe, site, compte, devise existent
  // S'ils existent
  // Récuperer le code societe, le code site, le numero compte et le code devise

  //récuperer le code journal
  let journaldata = null;
  if(data.idjournal){
    journaldata = await journal.get_onejournal(data.idjournal);
  }

  if (!data.codecaisse || !data.libelle) {
    throw new Error("Tous les champs (codecaisse, libelle) sont requis.");
  }

  const today = new Date();
  const newcaisse = new caissemodel(
    uuidv4(), 
    data.codecaisse, 
    data.libelle, 
    data.idjournal, 
    journaldata.codejournal || null, 
    data.iddevise, 
    data.codedevise || null, 
    data.idsite, 
    data.codesite || null,
    data.idsociete, 
    data.codesociete || null, 
    data.idcompte, 
    data.numcompte || null, 
    data.actif,  
    data.createdat || today, 
    data.createdby || 'System', 
    data.updatedat,
    data.updatedby);
  const recorded = await newcaisse.create_caissemodel(newcaisse);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }

  return recorded.data;
}

async function get_by_idcaisse(idcaisse) {
  if (!idcaisse) {
    throw new Error("Erreur de donnée");
  }

  try {
    const caisse_ = await caisse.get_onecaisse(idcaisse);
    return caisse_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function update_caisse(idcaisse, data) {
  if (!idcaisse || !data.codecaisse) {
    throw new Error("Erreur de donnée");
  }

  //Recuperer la societe de l'utilisateur connecté si societe n'est pas renseigné

  // Verifier si societe, site, compte, devise existent
  // S'ils existent
  // Récuperer le code societe, le code site, le numero compte et le code devise

  //récuperer le code journal
  let journaldata = null;
  if(data.idjournal){
    journaldata = await journal.get_onejournal(data.idjournal);
    data.codejournal = journaldata.codejournal || data.codejournal;
  }

  try {
    const caisse_ = await caisse.update_caisse(data.codecaisse, data);
    return caisse_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function delete_caisse(idcaisse) {
   try {
    const caisse_ = await caisse.delete_caisse(idcaisse);
    if (!caisse_.success) {
      throw new Error(caisse_.message);
    }
    return caisse_;
   } catch (err) {
    throw err;
   }
}

module.exports = {
  get_all_caisses,
  get_by_idcaisse,
  create_caisse,
  update_caisse,
  delete_caisse
};
