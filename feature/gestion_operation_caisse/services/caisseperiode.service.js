const caisseModel = require("../models/caisse.model");
const typeoperationmodel = require("../models/operation.model");
const periodeModel = require("../models/caisseperiode.model");
const { v4: uuidv4 } = require('uuid');
const PaginationModel = require("../../../shared/utils/model");
const caissemodel = new caisseModel();
let periodemodel = new periodeModel();
let typeoperation = new typeoperationmodel();
let caisseperiodes = [];
let user = null;

const userservice = require('../../gestion_users/services/users.service');

async function get_all_caisseperiodes(page = 1, limit = 5) {
  const result = await periodemodel.get_allcaisseperiodes(page, limit);

  try {
    caisseperiodes = result.data.map(item => new periodemodel(
      item.idperiode, item.idcaisse, item.dateperiode, item.soldeouverture,
      item.soldefermeture, item.montantphysique, item.ecart, item.statut,
      item.validatedat, item.validatedby, item.createdat, item.createdby,
      item.updatedat, item.updatedby,
      item.caisse ? new caisseModel(
        item.caisse_idcaisse, item.caisse_codecaisse, item.caisse_libelle,  item.caisse_idjournal,  item.caisse_iddevise, item.caisse_idsite, item.caisse_idsociete, item.caisse_idcompte ,
        item.caisse_actif, item.caisse_createdat, item.caisse_createdby,) : null
    ));
  } catch (error) {
    throw new Error("Aucune donnée trouvée");
  }
  return new PaginationModel(result.page, result.limit, result.total, caisseperiodes);
}

async function create_caisseperiode(data) {
  //récuperer le code caisse
  let caissedata = null;
  if(data.idcaisse){
    try {
      caissedata = await caissemodel.get_onecaisse(data.idcaisse);
    } catch (error) {
      throw new Error("Cette caisse n'existe pas");
    }
  }

  if (!data.dateperiode || !data.idcaisse) {
    throw new Error("Tous les champs (caisse, dateperiode) sont requis.");
  }

  const today = new Date();
  const newperiode = new periodeModel(
    uuidv4(), 
    data.idcaisse, data.dateperiode, data.soldeouverture, data.soldefermeture,  data.montantphysique, data.ecart, 
    data.statut, data.validatedat, data.validatedby, data.createdat || today, 
    data.createdby || 'System', data.updatedat, data.updatedby);

  const recorded = await newperiode.create_caisseperiode(newperiode);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }

  return {success: true, data: recorded.data};
}

async function get_by_idperiode(idperiode) {
  if (!idperiode) {
    throw new Error("Erreur de donnée");
  }

  try {
    const periode_ = await periodemodel.get_onecaisseperiode(idperiode);
    return periode_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function get_recentperiode(idcaisse) {
  if (!idcaisse) {
    throw new Error("Erreur de donnée");
  }

  try {
    const periode_ = await periodemodel.get_recentecaisseperiode(idcaisse);
    return periode_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function update_caisseperiode(idperiode, data) {
  if (!idperiode) {
    throw new Error("Erreur de donnée");
  }

  //Recuperer la societe de l'utilisateur connecté si societe n'est pas renseigné

  // Verifier si societe, site, compte, devise existent
  // S'ils existent
  // Récuperer le code societe, le code site, le numero compte et le code devise

  //récuperer le code journal
  let caissedata = null;
  if(data.idcaisse){
    caissedata = await caissemodel.get_onecaisse(data.idcaisse);
  }

  try {
    const periode = await periodemodel.update_caisseperiode(data.idperiode, data);
    return periode.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function delete_caisse(idperiode) {
   try {
    const periode = await periodemodel.delete_caisse(idperiode);
    if (!periode.success) {
      throw new Error(periode.message);
    }
    return periode;
   } catch (err) {
    throw err;
   }
}

async function fermeture_periode(idutilisateur, data) {
  if (!idutilisateur) {
    throw new Error("Erreur de donnée");
  }

  if(!Array.isArray(data) || data.length === 0){
    throw new Error("Aucune période de caisse fournie.");
  }

  //Recuperer user
  user = await userservice.getoneuser(idutilisateur);

  const results = [];

  for(const periode of data){
    const check_periode = await periodemodel.get_onecaisseperiode(periode.idperiode);
    if(check_periode.statut == 'fermee'){
      throw new Error("Erreur de fermeture");
    }

    if(check_periode.statut != 'ouverte'){
      throw new Error("Periode doit être ouverte");
    }

    let soldes = 0;
    soldes = await typeoperation.get_soldeperiode(check_periode.idperiode);
    const soldeItem = soldes.find(s => s.idcaisse === check_periode.idcaisse);
    const solde = soldeItem ? soldeItem.solde : 0;

    if(check_periode.statut == 'ouverte'){
      periode.statut = "cloturee";
    }

    if(!check_periode.soldefermeture || check_periode.soldefermeture == 0){
      periode.soldefermeture = Number(check_periode.soldeouverture + solde);
    }else{
      periode.soldefermeture = check_periode.soldefermeture;
    }

    const datePeriode = new Date(periode.dateperiode);
    const today = new Date();

    //Validateur
    periode.validatedby = user.data.nom + " " + user.data.prenom;

    // On met à 00:00 pour éviter les problèmes d'heures
    today.setHours(0, 0, 0, 0);
    datePeriode.setHours(0, 0, 0, 0);

    if (datePeriode > today) {
      throw new Error("La date de la journée ne peut pas être supérieure à la date du jour");
    }

    try {
      const periodeAs = await periodemodel.fermetureorclose_caisseperiode(periode.idperiode, periode);
      // Incrémente la date d'une journée
      const date = new Date(periode.dateperiode);
      date.setDate(date.getDate() + 1);
      const dateincrementee = date.toISOString().split("T")[0];
      const newDate = new Date(dateincrementee);

      if(periodeAs){
        const newperiode = new periodeModel(uuidv4(), periode.idcaisse, newDate, periode.soldefermeture, 0, 0, 0, 
        "non ouverte", periode.validatedat, null, periode.createdat || today, periode.createdby || 'System', periode.updatedat || null, periode.updatedby || null);
        const periodeNext = await newperiode.create_caisseperiode();
      }

      results.push(periode.recordset);
    } catch (err) {
      console.log(`Erreur de modification: ${err}`.cyan.bold);
      throw err;
    }
  }

  return results;
}

async function open_periode(idutilisateur, data) {
  if (!idutilisateur) {
    throw new Error("Erreur de donnée");
  }

  const results = [];

  if(!Array.isArray(data) || data.length === 0){
    throw new Error("Aucune période de caisse fournie.");
  }

  for(const caissep of data){
    const check_periode = await periodemodel.get_onecaisseperiode(caissep.idperiode);
    if(check_periode.statut == 'ouverte'){
      throw new Error("Caisse déja ouverte");
    }

    const datePeriode = new Date(caissep.dateperiode);
    const today = new Date();

    // On met à 00:00 pour éviter les problèmes d'heures
    today.setHours(0, 0, 0, 0);
    datePeriode.setHours(0, 0, 0, 0);

    if (datePeriode > today) {
      throw new Error("La date de la journée ne peut pas être supérieure à la date du jour");
    }

    caissep.statut = "ouverte";
    caissep.soldefermeture = 0;
    try {
      const periode = await periodemodel.fermetureorclose_caisseperiode(caissep.idperiode, caissep);
      results.push(periode.recordset);
    } catch (err) {
      throw err;
    }
  }

  return results;
}

async function validate_periode(idperiode, data) {
  if (!idperiode) {
    throw new Error("Erreur de donnée");
  }

  const check_periode = await periodemodel.get_onecaisseperiode(idperiode);
  if(check_periode.statut == 'ouverte'){
    throw new Error("Erreur de fermeture");
  }

  if(check_periode.statut != 'cloturee'){
    throw new Error("Periode doit être cloturée");
  }

  try {
    const periode = await periodemodel.validation_caisseperiode(idperiode, data);
    return periode.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function create_caisseBilletage(data) {
  let dataresponse = [];

  if(!Array.isArray(data)){
    throw new Error("Aucun élément fourni.");
  }

  for (const billetage of data){
    //récuperer le code caisse
    let billetagedata = null;
    if(billetage.idcaisse){
      try {
        billetagedata = await caissemodel.get_onecaisse(billetage.idcaisse);
      } catch (error) {
        throw new Error("Cette caisse n'existe pas");
      }
    }

    if (!billetage.idperiode) {
      throw new Error("Tous les champs (caisse, idperiode) sont requis.");
    }

    const today = new Date();
    billetage.idbilletage = uuidv4();
    billetage.montant = billetage.totalPhysique
    billetage.createdat = today;
    billetage.createdby = billetage.createdby || 'System';
    const newperiode = new periodeModel();
    const recorded = await newperiode.create_caissebilletage(billetage);
    // si le modèle renvoie une erreur
    if (!recorded.success) {
      throw new Error(recorded.message);
    }

    dataresponse.push(recorded.data)
  }

  return {success: true, data: dataresponse};
}

module.exports = {
  get_all_caisseperiodes,
  get_by_idperiode,
  create_caisseperiode,
  update_caisseperiode,
  fermeture_periode,
  validate_periode,
  open_periode,
  get_recentperiode,
  delete_caisse,
  create_caisseBilletage
};