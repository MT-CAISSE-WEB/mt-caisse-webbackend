const caissemodel = require("../models/caisse.model");
const journalmodel = require("../models/journal.model");
const devisemodel = require("../../gestion_organisation/models/devise.model");
const societemodel = require("../../gestion_organisation/models/societe.model");
const sitemodel = require("../../gestion_organisation/models/site.model");
const periode = require("../models/caisseperiode.model");
const deviseservice = require("../../gestion_organisation/services/devise.service");
const societeservice = require("../../gestion_organisation/services/societe.service");
const siteservice = require("../../gestion_organisation/services/site.service");
const periodeservice = require("./caisseperiode.service");
const { v4: uuidv4 } = require('uuid');
const PaginationModel = require("../../../shared/utils/model");

let caisse = new caissemodel();
let journal= new journalmodel();
let caisses = [];

async function get_all_caisses({ page, limit, search, actif}) {
  const result = await caisse.get_allcaisses({ page, limit, search, actif });
  try {
    caisses = result.data.map(item => new caissemodel(
      item.idcaisse,
      item.codecaisse,
      item.libelle,
      item.idjournal,
      item.iddevise,
      item.idsite,
      item.idsociete,
      item.idcompte,
      item.dateinitialisation,
      item.soldeinitialisation,
      item.seuilmnimal,
      item.actif,
      item.createdat,
      item.createdby,
      item.updatedat,
      item.updatedby,
      item.idjournal ? new journalmodel(
        item.journal_idjournal, item.journal_codejournal, item.journal_idsociete,  item.journal_designation,  item.journal_actif, item.journal_createdat, item.journal_createdby, item.journal_updatedat, item.journal_updatedby) : null,
      // Devise
      item.iddevise ? new devisemodel(
        item.devise_iddevise, item.devise_codedevise, item.devise_intitule, item.devise_codeiso, item.devise_actif, item.devise_createdat, item.devise_createdby, item.devise_updatedat, item.devise_updatedby) : null,
      // Site
      item.idsite ? new sitemodel(
        item.site_idsite, item.site_idsociete, null, item.site_libelle, item.site_email, item.site_telephone, item.site_adresse,
        item.site_createdat, item.site_updatedat, item.site_createdby, item.site_updatedby ) : null,

      item.idsociete ? new societemodel(
        item.societe_idsociete, item.societe_codesociete, item.societe_raisonsociale, item.societe_rccm, item.societe_numnui, item.societe_email, item.societe_telephone, item.societe_logo, item.societe_adresse, item.societe_suivibudgetaire, item.societe_createdat, item.societe_updatedat, item.societe_createdby, item.societe_updatedby
      ) : null,

      // Compte comptable
      item.idcompte ? {
        "idcompte" : item.compte_idcompte, "idsociete" : item.compte_idsociete, "numcompte" : item.compte_numcompte, "libelle" : item.compte_libelle, "ventillable" : item.compte_ventillable, "auxiliaire" : item.compte_auxiliaire, "actif" : item.compte_actif, "suivibudgetaire" : item.compte_suivibudgetaire, "suivibudgetairemensuel" : item.compte_suivibudgetairemensuel,
        "createdat" : item.compte_createdat, "createdby" : item.compte_createdby, "updatedat" : item.compte_updatedat, "updatedby" : item.compte_updatedby
      } : null
    ));
  } catch (error) {
    throw new Error(error);
  }
  return new PaginationModel(result.page, result.limit, result.total, caisses);
}

async function create_caisse(data) {
  //Recuperer la societe de l'utilisateur connecté si societe n'est pas renseigné
  let societe = null;
  if(data.idsociete){
    try {
      societe = await societeservice.getonesociete(data.idsociete);
    } catch (error) {
      throw new Error(error);
    }
  }else{
    throw new Error("Societe de utilisateur invalide");
  }

  // Verifier si societe, site, compte, devise existent
  let site = null;
  if(data.idsite){
    try {
      site = await siteservice.getonesite(data.idsite);
    } catch (error) {
      throw new Error(error);
    }
  }else{
    throw new Error("Site de utilisateur invalide");
  }
  // S'ils existent
  // Récuperer le code societe, le code site, le numero compte et le code devise

  //récuperer le code journal
  let journaldata = null;
  if(data.idjournal){
    journaldata = await journal.get_onejournal(data.idjournal);
  }else{
    throw new Error("Journal invalide");
  }

  if (!data.codecaisse || !data.libelle) {
    throw new Error("Tous les champs (codecaisse, libelle) sont requis.");
  }

  const today = new Date();
  const newcaisse = new caissemodel(
    uuidv4(), data.codecaisse, data.libelle, data.idjournal, data.iddevise,  
    data.idsite, data.idsociete, data.idcompte, data.dateinitialisation, data.soldeinitialisation,
    data.seuilminimal, data.actif, data.createdat || today, data.createdby || 'System', data.updatedat, data.updatedby);
  const recorded = await newcaisse.create_caissemodel(newcaisse);

  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }

  if(data.dateinitialisation){
    const periodecaisse = new periode(uuidv4(), recorded.data.idcaisse, data.dateinitialisation, data.soldeinitialisation, 0, 0, 0, 'non ouverte',
     null, null, data.createdat, data.createdby, data.updatedat, data.updatedby);

     const rec = await periodeservice.create_caisseperiode(periodecaisse);

     if(!rec.success){
      throw new Error("Erreur de création de la période");
     }
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
  let societe = null;
  if(data.idsociete){
    try {
      societe = await societeservice.getonesociete(data.idsociete);
    } catch (error) {
      throw new Error(error);
    }
  }else{
    throw new Error("Societe de utilisateur invalide");
  }

  // Verifier si societe, site, compte, devise existent
  let site = null;
  if(data.idsite){
    try {
      site = await siteservice.getonesite(data.idsite);
    } catch (error) {
      throw new Error(error);
    }
  }else{
    throw new Error("Site de utilisateur invalide");
  }

  //récuperer le code journal
  let journaldata = null;
  if(data.idjournal){
    journaldata = await journal.get_onejournal(data.idjournal);
    data.codejournal = journaldata.codejournal || data.codejournal;
  }

  if(data.dateinitialisation){
    const periodecaisse = new periode(uuidv4(), idcaisse, data.dateinitialisation, data.soldeinitialisation, 0, 0, 0, 'non ouverte',
     null, null, data.createdat, data.createdby, data.updatedat, data.updatedby);

     try {
       const rec = await periodecaisse.create_caisseperiode(periodecaisse);
     } catch (error) {
       throw new Error("Erreur de création de la période");
     }
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

async function getSolde() {
   try {
    const caisse_ = await caisse.getSolde();
    return caisse_;
   } catch (err) {
    console.log(err);
    throw err;
   }
}

module.exports = {
  get_all_caisses,
  get_by_idcaisse,
  create_caisse,
  update_caisse,
  delete_caisse,
  getSolde
};
