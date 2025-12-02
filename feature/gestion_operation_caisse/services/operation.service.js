const typeoperationmodel = require("../models/operation.model");
const { v4: uuidv4 } = require('uuid');
const societemodel = require("../../gestion_organisation/models/societe.model");
const sitemodel = require("../../gestion_organisation/models/site.model");
const devisemodel = require("../../gestion_organisation/models/devise.model");
const PaginationModel = require("../../../shared/utils/model");
const deviseservice = require("../../gestion_organisation/services/devise.service");
const societeservice = require("../../gestion_organisation/services/societe.service");
const siteservice = require("../../gestion_organisation/services/site.service");
const enteteoperationservice = require("../services/enteteoperation.service");
const ligneoperationservice = require("../services/ligneoperation.service");
const caisseservice = require("../services/caisse.service");

let typeoperation = new typeoperationmodel();
let typeoperations = [];

async function get_all_typeoperations(page = 1, limit = 5) {
  const result = await typeoperation.get_alltypeoperations(page, limit);
  try {
    const operations = {};
    result.data.forEach(row => {
      const idoperation = row.idoperation;
      // Si l’opération n'existe pas encore dans le dictionnaire, on la crée
      if (!operations[idoperation]) {
          operations[idoperation] = {
              idoperation: row.idoperation,
              codeoperation: row.codeoperation,
              dateoperation: row.dateoperation,
              idsociete : row.idsociete,
              idsite : row.idsite,
              iddevise : row.iddevise,
              montant : row.montant,
              createdat: row.createdat,
              createdby: row.createdby,
              updatedat: row.updatedat,
              updatedby: row.updatedby,
              lignes: [],
              types: [],
              // Devise
              devise : row.iddevise ? new devisemodel(
                row.devise_iddevise, row.devise_codedevise, row.devise_intitule, row.devise_codeiso, row.devise_actif, row.devise_createdat, row.devise_createdby, row.devise_updatedat, row.devise_updatedby) : null,
              // Site
              site : row.idsite ? new sitemodel(
                row.site_idsite, row.site_idsociete, null, row.site_idcentreanalytique, row.site_libelle, row.site_email, row.site_telephone, row.site_adresse, row.site_estcentreanalytique,
                row.site_createdat, row.site_updatedat, row.site_createdby, row.site_updatedby ) : null,

              societe : row.idsociete ? new societemodel(
                row.societe_idsociete, row.societe_codesociete, row.societe_raisonsociale, row.societe_rccm, row.societe_numnui, row.societe_email, row.societe_telephone, row.societe_logo, row.societe_adresse, row.societe_suivibudgetaire, row.societe_createdat, row.societe_updatedat, row.societe_createdby, row.societe_updatedby
              ) : null
          };
      }
      const op = operations[idoperation];
      // ---------------------------
      //Construction des lignes
      // ---------------------------
      if (row.ligne_idligneoperation) {

          // Vérifier si la ligne existe déjà
          const existingLine = op.lignes.find(l => l.idligneoperation === row.ligne_idligneoperation);

          if (!existingLine) {
              op.lignes.push({
                  idligneoperation: row.ligne_idligneoperation,
                  libelle: row.ligne_libelle,
                  montantoperation: row.ligne_montantoperation,
                  comptabilise: row.ligne_comptabilise,
                  numpiececomptable: row.ligne_numpiececomptable,
                  datecomptabilisation: row.ligne_datecomptabilisation,
                  //Nature incluse
                  nature: row.nature_idnature ? {
                      idnature: row.nature_idnature,
                      codenature: row.nature_codenature,
                      libelle: row.nature_libelle,
                      idcompte: row.nature_idcompte
                  } : null,
                  // Centre inclus
                  centre: row.centre_idcentreanalytique ? {
                      idcentreanalytique: row.centre_idcentreanalytique,
                      code: row.centre_codecentreanalytique,
                      libelle: row.centre_libelle
                  } : null,
                  //Tiers inclus
                  tiers: row.tiers_idtiers ? {
                      idtiers: row.tiers_idtiers,
                      codetiers: row.tiers_codetiers,
                      designation: row.tiers_designation,
                      typetiers: row.tiers_typetiers
                  } : null
              });
          }
      }
      // ---------------------------
      // Construction des types
      // ---------------------------
      if (row.type_idtypeoperation) {
          const exists = op.types.find(t => t.idtypeoperation === row.type_idtypeoperation);
          if (!exists) {
              op.types.push({
                  idtypeoperation: row.type_idtypeoperation,
                  codtypeoperation: row.type_codtypeoperation,
                  montant: row.type_montant,
                  idcaisse: row.type_idcaisse
              });
          }
      }
    });
    // Convertit en tableau
    typeoperations = Object.values(operations);
  } catch (error) {
    console.log(error);
  }

  // typeoperations = result.recordset.map(item => new typeoperationmodel(
  //   item.idtypeoperation,
  //   item.idoperation, 
  //   item.codeoperation, 
  //   item.idsociete,
  //   item.codesociete, 
  //   item.idsite,
  //   item.codesite,
  //   item.idcaisse,
  //   item.codecaisse, 
  //   item.montant, 
  //   item.createdat, 
  //   item.createdby, 
  //   item.updatedat,  
  //   item.updatedby));
  return new PaginationModel(result.page, result.limit, result.total, typeoperations);;
}

async function create_typeoperation(data) {
  const today = new Date();

  if (!data.caisseprincipale) {
    throw new Error("Le champ caisse principale est requis.");
  }

  if(data.typepaiement == 'bidevise' && !data.caissesecondaire){
    throw new Error("Le champ caisse secondaire est requis.");
  }

  //Récuperer la societe
  let societe = null;
  if(data.societe){
    societe = await societeservice.getonesociete(data.societe);
  }

  //Récuperer le site
  let site = null;
  if(data.site){
    site = await siteservice.getonesite(data.site);
  }

  let enteteoperation = null;
  enteteoperation = await enteteoperationservice.create_enteteoperation(data);

  if (!enteteoperation?.idoperation) {
    throw new Error("Échec de création de l'entête d'opération (idoperation manquant).");
  }

  if (!Array.isArray(data.lignes) || data.lignes.length === 0) {
    throw new Error("Aucune ligne fournie.");
  }

  for (const ligne of data.lignes){
    const dataligne = {idoperation : enteteoperation.idoperation, idnature: ligne.natureop, idcentre: ligne.centre, idtiers: ligne.tiers, montantoperation: ligne.montantligne, created: ligne.created};
    try {
      const ligneoperation = await ligneoperationservice.create_ligneoperation(dataligne);
    } catch (error) {
      console.log(error);
    }
  }

  let caisse = null;
  if(data.caissesecondaire && data.typepaiement == 'bidevise'){
    caisse = await caisseservice.get_by_idcaisse(data.caissesecondaire);
    const newtypeoperation1 = new typeoperationmodel(
    uuidv4(),enteteoperation.idoperation, enteteoperation.codeoperation, societe.idsociete, societe.codesociete ? societe.codesociete : null, 
    site.idsite ? site.idsite : null, site.codesite, caisse.idcaisse ? caisse.idcaisse : null, caisse.codecaisse ? caisse.codecaisse : null, 
    data.montantsecondaire, data.createdat || today, data.createdby || today, data.updatedat || 'System', data.updatedby || 'System');
    
    let recorded1 = null;
    try {
      recorded1 = await newtypeoperation1.create_typeoperationmodel(newtypeoperation1);
    } catch (error) {
      console.log(error);
    }
    
    // si le modèle renvoie une erreur
    if (!recorded1.success) {
      throw new Error(recorded1.message);
    }
  }

  caisse = await caisseservice.get_by_idcaisse(data.caisseprincipale);
  const newtypeoperation = new typeoperationmodel(
    uuidv4(),enteteoperation.idoperation, enteteoperation.codeoperation, societe.idsociete, societe.codesociete ? societe.codesociete : null, 
    site.idsite ? site.idsite : null, site.codesite, caisse.idcaisse ? caisse.idcaisse : null, caisse.codecaisse ? caisse.codecaisse : null, 
    data.montantprincipale, data.createdat || today, data.createdby || today, data.updatedat || 'System', data.updatedby || 'System');
  
  let recorded2 = null ;
  try {
    recorded2 = await newtypeoperation.create_typeoperationmodel(newtypeoperation);
    console.log(recorded2);
  } catch (error) {
    console.log(error);
  }
  
  // si le modèle renvoie une erreur
  if (!recorded2.success) {
    throw new Error(recorded2.message);
  }

  return enteteoperation;
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
