const societeservice = require("../../gestion_organisation/services/societe.service");
const siteservice = require("../../gestion_organisation/services/site.service");
const deviseservice = require("../../gestion_organisation/services/devise.service");
const enteteoperationmodel = require("../models/enteteoperation.model");
const { v4: uuidv4 } = require('uuid');
const compteurservice = require("../../gestion_paramètres/services/compteur.service");

let enteteoperation = new enteteoperationmodel();
let enteteoperations = [];

async function get_all_enteteoperations() {
  const result = await enteteoperation.get_allenteteoperations();
  enteteoperations = result.recordset.map(item => new enteteoperationmodel(
    item.idoperation,
    item.codeoperation, 
    item.iddemande, 
    item.codedemande,
    item.idsociete, 
    item.codesociete,
    item.dateoperation,
    item.createdat, 
    item.createdby, 
    item.updatedat,  
    item.updatedby));
  return enteteoperations;
}

async function create_enteteoperation(data) {
  if (!data.dateoperation) {
    throw new Error("Tous les champs (dateoperation) est requis.");
  }

  //Récuperer le site sur l'utilisateur connecté
  let site = null;
  if(data.site){
    site = await siteservice.getonesite(data.site);
  }else{
    throw new Error('Site utilisateur introuvable');
  }

  //Récuperer la devise
  let devise = null;
  if(data.devise){
    devise = await deviseservice.getonedevise(data.devise);
  }

  const datePeriode = new Date(data.dateoperation);
  
  const today = new Date();
  if (datePeriode > today) {
    throw new Error("La date operation ne peut pas être supérieure à la date du jour");
  }

  const compteur = await compteurservice.getall();
  // Trouver le compteur "operation"
  const demandeCompteur = compteur.data.find(c => c.typedocument != 'demande');

  // Fonction pour résoudre une séquence
  const resolveSequence = (sequence, prefixe) => {
    switch (sequence) {
      case 'site':
        return site.data?.codesite || '';
      case 'constante':
        return prefixe || '';
      default:
        return '';
    }
  };

  // Résolution des préfixes
  const prefixe = [
    resolveSequence(demandeCompteur?.sequence_1, demandeCompteur?.prefixe_1),
    resolveSequence(demandeCompteur?.sequence_2, demandeCompteur?.prefixe_2)
  ].join('');

  //Générer le numero d'operation
  //const prefix = "NUM";
  const numerogenere = await enteteoperation.create_numoperation(prefixe, datePeriode);
  const newenteteoperation = new enteteoperationmodel(
    uuidv4(),   
    data.codeoperation || numerogenere, 
    data.iddemande ? data.iddemande : null, 
    data.societe,
    data.site,
    data.devise,
    devise.data.codedevise,
    datePeriode,
    data.montant,
    data.createdat || today,
    data.createdby || 'System');
  const recorded = await newenteteoperation.create_enteteoperationmodel(newenteteoperation);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }

  return recorded.data;
}

async function get_by_identeteoperation(identeteoperation) {
  if (!identeteoperation) {
    throw new Error("Erreur de donnée");
  }

  try {
    const enteteoperation_ = await enteteoperation.get_oneenteteoperation(identeteoperation);
    return enteteoperation_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function update_enteteoperation(identeteoperation, data) {
  if (!data.dateoperation) {
    throw new Error("Erreur de donnée");
  }

  try {
    const enteteoperation_ = await enteteoperation.update_enteteoperation(data.codeoperation, data);
    return enteteoperation_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function delete_enteteoperation(identeteoperation) {
   try {
    const enteteoperation_ = await enteteoperation.delete_enteteoperation(identeteoperation);
    if (!enteteoperation_.success) {
      throw new Error(enteteoperation_.message);
    }
    return enteteoperation_;
   } catch (err) {
    throw err;
   }
}

module.exports = {
  get_all_enteteoperations,
  get_by_identeteoperation,
  create_enteteoperation,
  update_enteteoperation,
  delete_enteteoperation
};
