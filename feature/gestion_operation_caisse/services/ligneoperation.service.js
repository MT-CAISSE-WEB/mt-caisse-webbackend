const societeservice = require("../../gestion_organisation/services/societe.service");
const siteservice =  require("../../gestion_organisation/services/site.service");
const enteteOperationModel = require("../models/enteteoperation.model");
const ligneoperationmodel = require("../models/ligneoperation.model");
const { v4: uuidv4 } = require('uuid');

let ligneoperation = new ligneoperationmodel();
let operation = new enteteOperationModel();
let ligneoperations = [];

async function get_all_ligneoperations() {
  const result = await ligneoperation.get_allligneoperations();
  ligneoperations = result.recordset.map(item => new ligneoperationmodel(
    item.idligneoperation,
    item.idoperation, 
    item.codeoperation, 
    item.idsociete,
    item.codesociete, 
    item.idsite,
    item.codesite,
    item.idtiers,
    item.codetiers, 
    item.idnature, 
    item.codenature,
    item.idcentre, 
    item.codecentre,
    item.iddevise,
    item.codedevise,
    item.libelle, 
    item.montantoperation, 
    item.comptabilise,
    item.numpiececomptable, 
    item.datecomptabilisation,
    item.createdat, 
    item.createdby, 
    item.updatedat,  
    item.updatedby));
  return ligneoperations;
}

async function create_ligneoperation(data) {
  if (!data.idoperation) {
    throw new Error("Tous les champs (codeoperation) sont requis.");
  }

  //Recuperer la societe de l'utilisateur connecté si societe n'est pas renseigné
  // Verifier si societe, site, devise existent
  // S'ils existent
  // Récuperer le code societe, le code site, le code devise

  let enteteoperation = null;
  let societe = null;
  //let site = null;
  if(data.idoperation){
    enteteoperation = await operation.get_oneenteteoperation(data.idoperation);
    societe = await societeservice.getonesociete(enteteoperation.idsociete);
    // site = await siteservice.getonesite(enteteoperation.idsite);
  }

  const today = new Date();
  const newligneoperation = new ligneoperationmodel(
    uuidv4(),   
    data.idoperation, 
    enteteoperation.codeoperation || null,
    enteteoperation.idsociete || null,
    societe.data.codesociete || null,  
    data.idtiers || null,
    data.codetiers || null, 
    data.idnature || null, 
    data.codenature || null,
    data.idcentre || null, 
    data.codecentre || null,
    data.libelle, 
    data.montantoperation || null, 
    data.comptabilise || null,
    data.numpiececomptable || null, 
    data.datecomptabilisation || null,
    data.createdat || today,
    data.createdby || 'System',
    data.updatedat,
    data.updatedby
  );
  const recorded = await newligneoperation.create_ligneoperationmodel(newligneoperation);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }

  return recorded.data;
}

async function get_by_idligneoperation(idligneoperation) {
  if (!idligneoperation) {
    throw new Error("Erreur de donnée");
  }

  try {
    const ligneoperation_ = await ligneoperation.get_oneligneoperation(idligneoperation);
    return ligneoperation_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function update_ligneoperation(idligneoperation, data) {
<<<<<<< HEAD
  if (!idligneoperation || !data.idnature) {
=======
  if (!idligneoperation || !data.idnature || !data.idsite) {
>>>>>>> origin/richard
    throw new Error("Erreur de donnée");
  }

  try {
<<<<<<< HEAD
    const ligneoperation_ = await ligneoperation.update_ligneoperation(idligneoperation, data);
=======
    const ligneoperation_ = await ligneoperation.update_ligneoperation(data.codeligneoperation, data);
>>>>>>> origin/richard
    return ligneoperation_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function delete_ligneoperation(idligneoperation) {
   try {
    const ligneoperation_ = await ligneoperation.delete_ligneoperation(idligneoperation);
    if (!ligneoperation_.success) {
      throw new Error(ligneoperation_.message);
    }
    return ligneoperation_;
   } catch (err) {
    throw err;
   }
}

module.exports = {
  get_all_ligneoperations,
  get_by_idligneoperation,
  create_ligneoperation,
  update_ligneoperation,
  delete_ligneoperation
};
