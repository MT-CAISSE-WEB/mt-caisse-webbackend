const {sql, connectInstance, connectDB} = require('../../../config/db');
const caisseModel = require("../models/caisse.model");
const typeoperationmodel = require("../models/operation.model");
const periodeModel = require("../models/caisseperiode.model");
const { v4: uuidv4 } = require('uuid');
const PaginationModel = require("../../../shared/utils/model");
const societeservice = require('../../gestion_organisation/services/societe.service');
const caissemodel = new caisseModel();
const enteteDemandeModel = require("../../gestion_demande_decaissement/models/entetedemande.model");
let demandeModel = new enteteDemandeModel();
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

async function recalculate_solde(data){
  if (!data.startDate) {
    throw new Error("Aucune date envoyée");
  }

  const recent_periode = await get_recentperiode(data.idcaisse);

  if (!recent_periode) {
      throw new Error("Aucune période trouvée pour cette caisse");
  }

  const startDate = new Date(data.startDate);
  const recentDate = new Date(recent_periode.dateperiode);

  if (startDate > recentDate) {
      throw new Error(`La date ${data.startDate} est supérieure à la dernière période ouverte`);
  }

  //RECUPERER TOUTES LES PERIODES A RECALCULER
  const periodes = await periodemodel.get_periodes_between(
      data.idcaisse,
      data.startDate,
      recent_periode.dateperiode
  );

  const previousPeriode = await periodemodel.get_previous_periode(data.idcaisse, data.startDate );
  let soldeCourant;

  if (previousPeriode) {
      soldeCourant = Number(previousPeriode.soldeouverture);
  } else {
      soldeCourant = Number(
          periodes[0].caisse.soldeouverture
      );
  }

  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);

  try{
    await transaction.begin();

    for (let i = 0; i < periodes.length; i++) {
      const periode = periodes[i];

      if (i > 0) {
          periode.soldeouverture = soldeCourant;
      }

      const soldes = await typeoperation.get_soldeperiode(periode.idperiode);
      const soldeItem = soldes.find(s => s.idcaisse === periode.idcaisse);
      const solde = soldeItem ? Number(soldeItem.solde) : 0;
      const soldeFermeture = Number(periode.soldeouverture) + solde;

      const montantPhysique = Number(periode.montantphysique || 0);
      const ecart = periode.montantphysique != null ? montantPhysique - soldeFermeture : periode.ecart;

      const isLastPeriode = periode.idperiode === recent_periode.idperiode;

      if (isLastPeriode && periode.statut?.toLowerCase() === 'ouverte') {
        await periodemodel.update_soldeouverture(
            transaction,
            periode.idperiode,
            periode.soldeouverture
        );
      } else {
          await periodemodel.update_soldes(
            transaction,
            periode.idperiode,
            periode.soldeouverture,
            soldeFermeture,
            ecart
        );
      }
      soldeCourant = soldeFermeture;
    }

    await transaction.commit();
    
  }catch(error){
    await transaction.rollback();
    console.log(`Erreur de recalcul du solde: ${error}`.cyan.bold);
    throw new Error("Erreur lors du recalcul du solde");
  }

}

// Cache pour stocker les taux déjà récupérés
const tauxCache = new Map();

async function getTauxAvecCache(deviseOrigineId, deviseDestId, date) {
    // Normaliser la date au format YYYY-MM-DD pour éviter les variations horaires
    const normalizedDate = new Date(date).toISOString().split('T')[0];
    const key = `${deviseOrigineId}|${deviseDestId}|${normalizedDate}`;
    
    if (tauxCache.has(key)) {
        return tauxCache.get(key);
    }
    
    try {
        const taux = await demandeModel.getTauxRecent(deviseOrigineId, deviseDestId, normalizedDate);
        // Vérifier si taux existe et a une structure valide
        const tauxValue = (taux && taux[0] && taux[0].coefficient) 
            ? parseFloat(taux[0].coefficient) 
            : 1; // Par défaut 1 si aucun taux trouvé
        
        tauxCache.set(key, tauxValue);
        return tauxValue;
    } catch (error) {
        console.error(`Erreur récupération taux pour ${key}`, error);
        return 1; // En cas d'erreur, on retourne 1 (pas de conversion)
    }
}

async function get_caisse_tresorerie_by_date(startDate, endDate, idcaisse){

  //Recuperer la devise de référence de la société
  const societe = await societeservice.getallsociete();
  const deviseReferenceId = societe.data[0].iddevisereference;

  const allcaisse = await periodemodel.get_caisse_tresorerie_by_date(startDate, endDate, idcaisse);
  // const data =  buildTresorerieParDate(allcaisse);
  //const filledData = fillMissingDates(allcaisse, startDate, endDate);

  const data = await buildTresorerieConversion(allcaisse, deviseReferenceId);

  console.log("Données de trésorerie:", data);

  return data;
}

function buildTresorerieParDate(rows) {

    const datesMap = new Map();
    let totalEncaissementRef = 0;
    let totalDecaissementRef = 0;
    let soldeGlobalRef = 0;

    for (const row of rows) {

        const dateKey = new Date(row.dateperiode)
            .toISOString()
            .split('T')[0];

        if (!datesMap.has(dateKey)) {
            datesMap.set(dateKey, {
                dateperiode: dateKey,
                caisses: [],
                totalEncaissementRef: 0,
                totalDecaissementRef: 0,
                soldeGlobalRef: 0
            });
        }

        datesMap.get(dateKey).caisses.push({
            idcaisse: row.idcaisse,
            codecaisse: row.codecaisse,
            libelle: row.libelle,
            iddevise: row.iddevise,
            codedevise: row.codedevise,
            soldeouverture: Number(row.soldeouverture),
            total_encaissement: Number(row.total_encaissement),
            total_decaissement: Number(row.total_decaissement),
            total_encaissement_ref: Number(row.total_encaissement_ref),
            total_decaissement_ref: Number(row.total_decaissement_ref),
            solde_theorique: Number(row.solde_theorique),
            solde_previsionnel_fermeture: Number(row.solde_previsionnel_fermeture)
        });

        // Accumuler les totaux globaux (en devise de référence)
        datesMap.get(dateKey).totalEncaissementRef += Number(row.total_encaissement_ref);
        datesMap.get(dateKey).totalDecaissementRef += Number(row.total_decaissement_ref);
        datesMap.get(dateKey).soldeGlobalRef += Number(row.solde_previsionnel_fermeture);
    }

    return Array.from(datesMap.values());
}

async function buildTresorerieConversion(datasBrutes, deviseReferenceId) {
    const lignesConverties = [];

    let totauxGlobaux = {
        solde_ouverture_ref: 0,
        total_encaissement_ref: 0,
        total_decaissement_ref: 0,
        solde_global_ref: 0
    };

    for (const row of datasBrutes) {
        const taux = await getTauxAvecCache(row.iddevise, deviseReferenceId, row.dateperiode);
        // Calcul des montants convertis
        const soldeouverture_ref = row.soldeouverture * taux;
        const total_encaissement_ref = row.total_encaissement * taux;
        const total_decaissement_ref = row.total_decaissement * taux;
        const solde_theorique_ref = row.solde_theorique * taux;

        // Ajout aux totaux globaux
        totauxGlobaux.solde_ouverture_ref += soldeouverture_ref;
        totauxGlobaux.total_encaissement_ref += total_encaissement_ref;
        totauxGlobaux.total_decaissement_ref += total_decaissement_ref;
        totauxGlobaux.solde_global_ref += solde_theorique_ref; // ou soldeouverture_ref + total_encaissement_ref - total_decaissement_ref

        // Préparer l'objet enrichi (similaire à avant, mais avec les champs convertis)
        lignesConverties.push({
            ...row,
            soldeouverture_ref,
            total_encaissement_ref,
            total_decaissement_ref,
            solde_theorique_ref,
            taux_application: taux
        });
    }

    // Reconstruire la structure par date (comme votre buildTresorerieParDate)
    const datesMap = new Map();

    for (const row of lignesConverties) {
        const dateKey = new Date(row.dateperiode).toISOString().split('T')[0];

        if (!datesMap.has(dateKey)) {
            datesMap.set(dateKey, { dateperiode: dateKey, caisses: [], totauxGlobaux: {
                soldeouverture_ref: 0,
                total_encaissement_ref: 0,
                total_decaissement_ref: 0,
                solde_global_ref: 0}
            });
        }

        // Ajouter les totaux globaux à chaque date
        datesMap.get(dateKey).totauxGlobaux.soldeouverture_ref += row.soldeouverture_ref;
        datesMap.get(dateKey).totauxGlobaux.total_encaissement_ref += row.total_encaissement_ref;
        datesMap.get(dateKey).totauxGlobaux.total_decaissement_ref += row.total_decaissement_ref;
        datesMap.get(dateKey).totauxGlobaux.solde_global_ref += row.solde_theorique_ref;

        datesMap.get(dateKey).caisses.push({
            idcaisse: row.idcaisse,
            codecaisse: row.codecaisse,
            libelle: row.libelle,
            codedevise: row.codedevise,
            soldeouverture: row.soldeouverture,
            soldeouverture_ref: row.soldeouverture_ref,
            total_encaissement: row.total_encaissement,
            total_encaissement_ref: row.total_encaissement_ref,
            total_decaissement: row.total_decaissement,
            total_decaissement_ref: row.total_decaissement_ref,
            solde_theorique: row.solde_theorique,
            solde_theorique_ref: row.solde_theorique_ref,
            solde_previsionnel_fermeture: row.solde_previsionnel_fermeture
        });

    }

    return {
        dates: Array.from(datesMap.values()),
        totaux: totauxGlobaux
    };
}

/**
 * Complète les données de trésorerie pour que chaque caisse apparaisse à chaque date de l'intervalle,
 * avec le dernier solde connu pour les dates sans période.
 * @param {Array} existingRows - Lignes issues de la requête SQL (périodes existantes)
 * @param {string} startDate - Date de début (YYYY-MM-DD)
 * @param {string} endDate - Date de fin (YYYY-MM-DD)
 * @returns {Array} Lignes complétées, prêtes à être groupées par date
 */
function fillMissingDates(existingRows, startDate, endDate) {
    // 1. Extraire toutes les caisses uniques
    const caissesMap = new Map();
    for (const row of existingRows) {
        if (!caissesMap.has(row.idcaisse)) {
            caissesMap.set(row.idcaisse, {
                idcaisse: row.idcaisse,
                codecaisse: row.codecaisse,
                libelle: row.libelle,
                iddevise: row.iddevise,
                codedevise: row.codedevise
            });
        }
    }
    const caisses = Array.from(caissesMap.values());

    // 2. Générer toutes les dates de l'intervalle (inclus)
    const allDates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
        allDates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }

    // 3. Index des lignes existantes par clé idcaisse|date
    const existingMap = new Map();
    for (const row of existingRows) {
        const key = `${row.idcaisse}|${row.dateperiode}`;
        existingMap.set(key, row);
    }

    const filledRows = [];

    for (const caisse of caisses) {
        let lastKnownSolde = 0; // dernier solde d'ouverture connu pour cette caisse
        const datesSorted = [...allDates].sort(); // dates croissantes

        for (const date of datesSorted) {
            const key = `${caisse.idcaisse}|${date}`;
            const existing = existingMap.get(key);

            if (existing) {
                // Période existante : on garde la ligne et on met à jour le dernier solde connu
                lastKnownSolde = existing.soldeouverture;
                filledRows.push({ ...existing });
            } else {
                // Période manquante : on crée une ligne artificielle
                filledRows.push({
                    idcaisse: caisse.idcaisse,
                    codecaisse: caisse.codecaisse,
                    libelle: caisse.libelle,
                    dateperiode: date,
                    soldeouverture: lastKnownSolde,
                    iddevise: caisse.iddevise,
                    codedevise: caisse.codedevise,
                    total_encaissement: 0,
                    total_encaissement_ref: 0,
                    total_decaissement: 0,
                    total_decaissement_ref: 0,
                    solde_theorique: lastKnownSolde,
                    solde_previsionnel_fermeture: lastKnownSolde
                });
            }
        }
    }

    return filledRows;
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
  create_caisseBilletage,
  recalculate_solde,
  get_caisse_tresorerie_by_date
};