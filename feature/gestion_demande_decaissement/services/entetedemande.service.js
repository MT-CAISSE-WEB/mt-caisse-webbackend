const enteteDemandeModel = require("../models/entetedemande.model");
const societemodel = require("../../gestion_organisation/models/societe.model")
const sitemodel = require("../../gestion_organisation/models/site.model");
const devisemodel = require("../../gestion_organisation/models/devise.model");
const { v4: uuidv4 } = require('uuid');
const PaginationModel = require("../../../shared/utils/model");
const deviseservice = require("../../gestion_organisation/services/devise.service");
const societeservice = require("../../gestion_organisation/services/societe.service");
const siteservice = require("../../gestion_organisation/services/site.service");
const enteteoperationmodel = require("../../gestion_operation_caisse/models/enteteoperation.model");
const lignedemandeservice = require("../services/ligendemande.service");
const detaildemandeservice = require("../services/detaildemande.service");
const lignedemandeModel = require("../models/lignedemande.model");

let demandeModel = new enteteDemandeModel();
let demandesArray = [];
let enteteoperation = new enteteoperationmodel();
let lignedemandemodel = new lignedemandeModel();

async function create_demande(data) {
  const today = new Date();
  const datePeriode = new Date(data.datedemande);

  if (!Array.isArray(data.lignes) || data.lignes.length === 0) {
    throw new Error("Aucune ligne fournie.");
  }

  //Récuperer la societe
  let societe = null;
  if(data.societe){
    societe = await societeservice.getonesociete(data.societe);
  }else{
    throw new Error('Société utilisateur introuvable');
  }

  //Récuperer le site
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
  }else{
    throw new Error('Dévise inexistante dans la base');
  }

  if(societe && societe.data.suivibudgetaire == 1){
    for (const ligne of data.lignes){
      try {
        const budgetsAll = await lignedemandemodel.resolveBudget({
          idsociete: data.societe || societe.idsociete, idsite: data.site || site.idsite,
          iddepartement: data.departement, idnature: ligne.natureop, datedemande: data.datedemande
        });

        const budgets = prioriserBudget(budgetsAll);
        try {
          const check_soldeBudget = await lignedemandemodel.checkBudgetSolde({
            idbudget : budgets.idbudget, idnature: ligne.natureop,
            montant: ligne.montantdemande, iddepartement : data.departement
          });
        } catch (error) {
          throw new Error(error);
        }
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  //Génération du code de la demande
  const prefix = "DEC";
  const numerogenere = await enteteoperation.create_numoperation(prefix, datePeriode);

  //Recuperer le circuit de validation de la demande
  const circuit = await demandeModel.get_circuitValidation(data.site);
  //Vérifier si le circuit a des validateurs ou pas

  let entetedemande = null;
  const newentete = new enteteDemandeModel(uuidv4(), numerogenere, data.demandeur, data.typedemande, data.libelledemande,
  data.datedemande, data.decaisse || 0, data.solde || 0, data.statut || 0, circuit[0].idcircuitvalidation || null, data.societe || societe.data.idsociete, data.site || site.data.idsite, 
  data.departement || null, data.devise || devise.iddevise, data.niveauactuel || null, data.createdat || today, data.createdby || 'systeme', data.updatedat || null, data.updatedby || null);
  entetedemande = await newentete.create_enteteDemande();

  if (!entetedemande?.data.iddemande) {
    throw new Error("Échec de création de l'entête de la demande (iddemande manquant).");
  }

  //Récuperer les validateurs du cicruit
  const validateur_circuits = await demandeModel.prepareValidateurCircuit(entetedemande.data.idcircuit)
  if(validateur_circuits || validateur_circuits.length > 0){
    for(const valid of validateur_circuits){
      const dataValidation = {iddemande: entetedemande.data.iddemande, idcircuitvalidation: valid.idcircuitvalidation,
        idcircuitetape : valid.idcircuitetape, user: valid.idutilisateur, rang: valid.rang
      }

      const init = await demandeModel.initValidationDemande(dataValidation);
    }
  }

  let num = 0;
  for (const ligne of data.lignes){
    num = num + 1;
    let budget_ = null;
    // 1. Résoudre automatiquement le budget
    const budgetsAll = await lignedemandemodel.resolveBudget({
      idsociete: data.societe || societe.idsociete, idsite: data.site || site.idsite,
      iddepartement: data.departement, idnature: ligne.natureop, datedemande: data.datedemande
    });

    const budgets = prioriserBudget(budgetsAll);

    if(societe && societe.data.suivibudgetaire == 1){
      budget_ = budgets.idbudget;
    }

    const dataligne = {iddemande : entetedemande.data.iddemande, numligne: num, libellelignedemande: data.libelledemande, montantdemande: ligne.montantdemande, idnature: ligne.natureop, idcentre: ligne.centre, idtiers: ligne.tiers || null,
      idbudget: budget_ || null, idsociete: data.societe || societe.data.idsociete, idsite: data.site || site.data.idsite, createdby: data.createdby || 'system'};
    try {
      const lignedemande = await lignedemandeservice.create_lignedemande(dataligne);
      let compteur = 0;
      for(const detail of ligne.details){
        compteur = compteur + 1;
        const datadetail = {iddemande : entetedemande.data.iddemande, idlignedemande: lignedemande.idlignedemande, idsociete : data.societe || societe.idsociete,
          description: detail.description, quantite: detail.quantite, montant: detail.montant, createdby: data.createdby || 'system'}
        try {
          const detaildemande = await detaildemandeservice.create_detaildemande(datadetail);
        } catch (error) {
          throw new Error(error);
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }
  
  return data;
}

async function getAll({page, limit , search, status}) {
  const result = await demandeModel.get_allDemandes({page, limit , search, status});
  try{
    const demandes = {};
    result.data.forEach(row => {
      const iddemande = row.iddemande;
      //Si la demande n'existe pas encore dans le dictionnaire, on la crée
      if (!demandes[iddemande]) {
        demandes[iddemande] = {
          iddemande: row.iddemande,
          codedemande : row.codedemande,
          typedemande : row.typedemande,
          libelledemande : row.libelledemande,
          datedemande : row.datedemande,
          decaisse : row.decaisse,
          solde : row.solde,
          statut : row.statut,
          idciruit: row.idcircuit,
          canValidate: row.canValidate,
          createdat : row.entete_createdat,
          createdby : row.entete_createdby,
          updatedat : row.entete_updatedat,
          updatedby : row.entete_updatedby,
          iddemandeur : row.idutilisateur,
          idsociete : row.idsociete,
          idsite : row.idsite,
          iddevise: row.iddevise,
          demandeur: {
            idutilisateur: row.idutilisateur,
            nom : row.nom,
            prenom : row.prenom
          },
          devise : {
            iddevise: row.iddevise,
            codedevise : row.codedevise
          },
          societe : {
            idsociete : row.idsociete,
            codesociete : row.codesociete,
            raisonsociale: row.raisonsociale
          },
          site : {
            idsite: row.idsite,
            libelle : row.site
          },
          departement : {
            iddepartement : row.iddepartement,
            codedept: row.codedept,
            libelle: row.libelledept
          },
          lignes : [],
          _lignesMap: {} // interne
        }
      }

      const demande = demandes[row.iddemande];

      /* =========================
      LIGNE DEMANDE
      ========================= */

      if (row.idlignedemande) {
        if (!demande._lignesMap[row.idlignedemande]) {
          demande._lignesMap[row.idlignedemande] = {
            idlignedemande: row.idlignedemande,
            numligne: row.numligne,
            libellelignedemande: row.libellelignedemande,
            montantdemande: row.montantdemande,
            natureoperation: {
              id: row.idnatureop,
              libelle: row.natureoperation
            },
            centreanalytique: {
              id: row.idcentreana,
              libelle: row.centreanalytique
            },
            details: []
          };

          demande.lignes.push(demande._lignesMap[row.idlignedemande]);
        }

        const ligne = demande._lignesMap[row.idlignedemande];

        /* =========================
          3️⃣ DÉTAIL DEMANDE
        ========================= */

        if (row.iddetailsdemande) {
          ligne.details.push({
            iddetailsdemande: row.iddetailsdemande,
            quantite: row.quantite,
            montant: row.montant,
            description: row.description
          });
        }
      }
    });

    /* =========================
     Netoyage des maps internes
    ========================= */
    demandesArray =  Object.values(demandes).map(d => {delete d._lignesMap; return d;});

  }catch(err){
    throw new Error(err);
  }

  return new PaginationModel(result.page, result.limit, result.total, demandesArray);
}

async function get_demande_by_id(iddemande){
  if(!iddemande){
    throw new Error("Erreur de donnée");
  }

  try {
    const rows = await demandeModel.get_demande_by_id(iddemande);
    if (!rows || rows.length === 0) {
      throw new Error("Demande introuvable");
    }

    let demande = null;
    const lignesMap = {};

    for (const row of rows) {
      if (!demande) {
        demande = {
          iddemande: row.iddemande,
          codedemande: row.codedemande,
          typedemande: row.typedemande,
          libelledemande: row.libelledemande,
          datedemande: row.datedemande,
          decaisse: row.decaisse,
          solde: row.solde,
          statut: row.statut,
          createdat: row.entete_createdat,
          updatedat: row.entete_updatedat,
          iddemandeur: row.idutilisateur,
          iddepartement: row.iddepartement,
          idsociete: row.idsociete,
          idsite: row.idsite,
          iddevise: row.iddevise,

          demandeur: {
            idutilisateur: row.idutilisateur,
            nom: row.nom,
            prenom: row.prenom
          },

          devise: {
            iddevise: row.iddevise,
            codedevise: row.codedevise
          },

          societe: {
            idsociete: row.idsociete,
            codesociete: row.codesociete,
            raisonsociale: row.raisonsociale
          },

          site: {
            idsite: row.idsite,
            libelle: row.site
          },
          departement : {
            iddepartement : row.iddepartement,
            codedept: row.codedept,
            libelle: row.libelledept
          },

          lignes: [],
          totaldemande: 0
        };
      }

      /* =========================
          2️⃣ LIGNE DEMANDE
      ========================= */
      if (row.idlignedemande) {
        if (!lignesMap[row.idlignedemande]) {
          lignesMap[row.idlignedemande] = {
            idlignedemande: row.idlignedemande,
            numligne: row.numligne,
            libellelignedemande: row.libellelignedemande,
            montantdemande: row.montantdemande,
            totaldetails: 0,
            natureoperation: {
              idnature: row.idnatureop,
              libelle: row.natureoperation
            },
            centreanalytique: {
              idcentre: row.idcentreana,
              libelle: row.centreanalytique
            },
            tiers: {
              idtiers: row.idtiers,
              designation: row.designationtiers,
              codetiers: row.codetiers,
            },
            details: []
          };

          demande.lignes.push(lignesMap[row.idlignedemande]);
          // total demande = somme des lignes
          demande.totaldemande += row.montantdemande || 0;
        }

        /* =========================
            3️⃣ DÉTAIL DEMANDE
        ========================= */
        if (row.iddetailsdemande) {
          lignesMap[row.idlignedemande].details.push({
            iddetailsdemande: row.iddetailsdemande,
            quantite: row.quantite,
            montant: row.montant,
            description: row.description
          });

          lignesMap[row.idlignedemande].totaldetails += row.montant || 0;
        }
      }
    }
    return demande;

  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function update_demande(iddemande, data) {
  if (!iddemande || !data.codedemande) {
    throw new Error("Erreur de données");
  }

  if (!Array.isArray(data.lignes)) {
    throw new Error("Lignes invalides");
  }

  const societe = data.societe ? await societeservice.getonesociete(data.societe) : null;

  const site = data.site ? await siteservice.getonesite(data.site) : null;

  /* =====================
      UPDATE ENTÊTE
  ===================== */
  await demandeModel.update_enteteDemande(iddemande, data);

  /* =====================
     LIGNES
  ===================== */
  for (const ligne of data.lignes) {
    const dataligne = {
      iddemande,libellelignedemande: data.libelledemande,montantdemande: ligne.montantdemande,idnature: ligne.natureop,idcentre: ligne.centre, idtiers: ligne.tiers || null, idsociete: data.societe, idsite: data.site, updatedby: data.updatedby || 'system'
    };

    let idlignedemande = ligne.idlignedemande;

    if (idlignedemande) {
      await lignedemandeservice.update_lignedemande(idlignedemande, dataligne);
    } else {
      const newLine = await lignedemandeservice.create_lignedemande(dataligne);
      idlignedemande = newLine.idlignedemande;
    }

    if (Array.isArray(ligne.details) && ligne.details.length > 0) {
      for (const detail of ligne.details) {
        const detailLine = { iddemande, idlignedemande, description: detail.description, quantite: detail.quantite, montant: detail.montant, updatedby: data.updatedby || 'system'}

        let iddetailligne = detail.iddetailsdemande
        if(iddetailligne){
          await detaildemandeservice.update_detaildemande(iddetailligne, detailLine);
        }else{
          await detaildemandeservice.create_detaildemande(detailLine);
        }
      }
    }
}

  return { success: true };
}

async function delete_demande(iddemande){
    if (!iddemande) {
        throw new Error("ID Demande requis");
    }

    try {
        const demande_ = await demandeModel.delete_enteteDemande(iddemande);
        if (!demande_.success) {
          throw new Error(demande_.message);
        }
        return demande_;
    } catch (err) {
        throw err;
    }
}

async function get_demandeAvalider(idutilisateur){
    if (!idutilisateur) {
        throw new Error("ID Utilisateur requis");
    }

    try {
        const demande_ = await demandeModel.getDemandeAvalider(idutilisateur);
        return demande_;
    } catch (err) {
        throw err;
    }
}

async function validate(iddemande, data){
  if (!iddemande || !data.decision) {
    throw new Error("Données invalides");
  }

  if (data.decision === 'refuser' && !data.motif) {
    throw new Error("Motif requis");
  }

  //Le statut de la demande dépend de l'etat global du statut (identete, statut, idcircuitValidation)
  let demande = null
  demande = await demandeModel.get_demande_by_id(iddemande);
  if (!demande) {
    throw new Error("Demande introuvable");
  }

  //Récupérer l'étape du validateur courant ou du dernier validateur
  //const validation = await circuitModel.get_validation_by_demande_and_user(iddemande,idutilisateur);
  // if (!validation) {
  //   throw new Error("Vous n'êtes pas autorisé à valider cette demande");
  // }
  // if (validation.statut_validation !== 0) {
  //   throw new Error("Cette demande a déjà été traitée par vous");
  // }

  // Mettre à jour l'étape courante
  //await circuitModel.update_validation(validation.id, {statut_validation: data.decision === 'accepter' ? 1 : 2, date_validation: new Date(), motif: data.motif || null});

  // CAS REFUS → arrêt immédiat
  // if (data.decision === 'refuser') {
  //   await demandeModel.update_statut_demande(iddemande, 3);
  //   return { statut: 3, message: "Demande rejetée" };
  // }
  // Vérifier s'il reste des validations en attente
  // const validationsRestantes =
  //   await circuitModel.count_validation_en_attente(iddemande);

  // if (validationsRestantes > 0) {
  //   // Toujours en cours
  //   await demandeModel.update_statut_demande(iddemande, 1);
  //   return { statut: 1, message: "Validation enregistrée, circuit en cours" };
  // }

  // // Toutes validées
  // await demandeModel.update_statut_demande(iddemande, 2);
  return { statut: 2, message: "Demande validée définitivement" };
}

function prioriserBudget(budgets) {
  const PRIORITY = {
    'Mensuel': 1,
    'Annuel': 2
  };

  return budgets.sort(
    (a, b) => PRIORITY[a.typebudget] - PRIORITY[b.typebudget]
  )[0];
}

module.exports = {
  getAll,
  create_demande,
  get_demande_by_id,
  update_demande,
  delete_demande,
  validate,
  get_demandeAvalider
};