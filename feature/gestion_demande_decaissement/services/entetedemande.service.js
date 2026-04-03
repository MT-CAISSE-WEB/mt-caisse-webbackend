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
const userservice = require("../../gestion_users/services/users.service")
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

        //Si le budget existe
        if(budgetsAll && budgetsAll.length != 0){
          const budgets = prioriserBudget(budgetsAll);
          try {
            const check_soldeBudget = await lignedemandemodel.checkBudgetSolde({
              idbudget : budgets.idbudget, idnature: ligne.natureop,
              montant: ligne.montantdemande, iddepartement : data.departement
            });
          } catch (error) {
            throw new Error(error);
          }
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
  let circt = null
  const circuit = await demandeModel.get_circuitValidation(data.site);
  if(circuit && circuit.length != 0){
    circt = circuit[0].idcircuitvalidation;
  }

  let entetedemande = null;
  const newentete = new enteteDemandeModel(uuidv4(), numerogenere, data.demandeur, data.typedemande, data.libelledemande, data.taux || 1,
  data.datedemande, data.decaisse || 0, data.solde || 0, data.statut || 0, circt || null, data.societe || societe.data.idsociete, data.site || site.data.idsite, 
  data.departement || null, data.devise || devise.iddevise, 1, data.createdat || today, data.createdby || 'systeme', data.updatedat || null, data.updatedby || null);

  try {
    entetedemande = await newentete.create_enteteDemande();
  } catch (error) {
    throw new Error(error);
  }

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
    let preengage = 0;
    let engage = 0;
    let realise = 0;

    if(societe && societe.data.suivibudgetaire == 1){
      // 1. Résoudre automatiquement le budget
      const budgetsAll = await lignedemandemodel.resolveBudget({
        idsociete: data.societe || societe.idsociete, idsite: data.site || site.idsite,
        iddepartement: data.departement, idnature: ligne.natureop, datedemande: data.datedemande
      });

      if(budgetsAll && budgetsAll.length != 0){
        const budgets = prioriserBudget(budgetsAll);
        budget_ = budgets.idbudget;
      }

      //Calcule des valeurs budgetaires
      const preengages = await lignedemandemodel.get_preengageBynature(ligne.natureop) ;
      preengage = preengages[0].preengage;
      const engages = await lignedemandemodel.get_engageBynature(ligne.natureop) ;
      engage = engages[0].engage;
      const realises = await lignedemandemodel.get_realiseBynature(ligne.natureop) ;
      realise = realises[0].realise;
    }

    const montantref = (ligne.montantdemande * entetedemande.data.taux) || ligne.montantdemande;

    const dataligne = {iddemande : entetedemande.data.iddemande, numligne: num, libellelignedemande: data.libelledemande, montantdemande: ligne.montantdemande, idnature: ligne.natureop, idcentre: ligne.centre, idtiers: ligne.tiers || null,
      idbudget: budget_ || null, montantref: montantref, preengage: preengage, engage: engage, realise : realise,  idsociete: data.societe || societe.data.idsociete, idsite: data.site || site.data.idsite, createdby: data.createdby || 'system'};
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

async function getAll({page, limit , search, status, user}) {

  //Récuperer les data de l'utilisateur connecté
  const userconnect = await userservice.getoneuser(user);

  const result = await demandeModel.get_allDemandes({page, limit , search, status}, userconnect.data);
  if (!result || result.length === 0) {
    throw new Error("Liste des demandes non chargée");
  }

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
          circuitExist: row.circuitExist,
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
          taux: row.taux,
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
          idcircuit : row.circuit_idcircuit,

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

  /* =====================
      GET ENTÊTE
  ===================== */
  let demande = null
  demande = await get_demande_by_id(iddemande);
  if (!demande) {
    throw new Error("Demande introuvable");
  }

  if(demande.decaisse == 1){
    throw new Error("Demande déja decaissée");
  }
  
  if (demande.decaisse != 1 && Number(demande.statut) === 3) {
    throw new Error(`Erreur modification sur une demande validée`);
  }else{
    // Update entete demande
    await demandeModel.update_enteteDemande(iddemande, data); 

    // Réinitialiser le circuit de validation
    await demandeModel.resetCircuitByDemande(iddemande);
    
    //Recuperer le circuit de validation de la demande
    let circt = null
    const circuit = await demandeModel.get_circuitValidation(data.site);
    if(circuit && circuit.length != 0){
      circt = circuit[0].idcircuitvalidation;
    }
    
    // Recreer le circuit de la demande
    const validateur_circuits = await demandeModel.prepareValidateurCircuit(data.circuit)
    if(validateur_circuits || validateur_circuits.length > 0){
      for(const valid of validateur_circuits){
        const dataValidation = {iddemande: iddemande, idcircuitvalidation: valid.idcircuitvalidation,
          idcircuitetape : valid.idcircuitetape, user: valid.idutilisateur, rang: valid.rang
        }
        const init = await demandeModel.initValidationDemande(dataValidation);
      }
    }

    /* =====================
      LIGNES
    ===================== */
    let num = 0;
    for (const ligne of data.lignes) {
      num = num + 1;
      let preengage = 0;
      let engage = 0;
      let realise = 0;

      const montantref = (ligne.montantdemande * data.taux) || ligne.montantdemande;

      const dataligne = {
        iddemande,libellelignedemande: data.libelledemande, montantdemande: ligne.montantdemande, idnature: ligne.natureop,idcentre: ligne.centre, idtiers: ligne.tiers || null, 
        montantref: montantref, preengage: preengage, engage: engage, realise : realise, idsociete: data.societe, idsite: data.site, updatedby: data.updatedby || 'system'
      };

      let idlignedemande = ligne.idlignedemande;

      if(idlignedemande) {
        try {
          console.log(ligne);
          await lignedemandeservice.update_lignedemande(idlignedemande, dataligne);
        } catch (error) {
          throw new Error(error);
        }
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
    throw new Error("Aucune donnée reçue");
  }

  if (data.decision === 'refuser' && !data.comment) {
    throw new Error("Motif requis");
  }

  if (data.decision === 'complement' && !data.comment) {
    throw new Error("Motif requis");
  }

  let demande = null
  demande = await demandeModel.get_demande_by_id(iddemande);
  if (!demande) {
    throw new Error("Demande introuvable");
  }

  if(demande[0].statut == 3){
    throw new Error("Demande non validable");
  }else{
    const filtreData = {iddemande: demande[0].iddemande, iduser : data.userId, niveauactuel: demande[0].niveauactuel}
    const droit = await demandeModel.check_doit_user(filtreData);
    if (!droit.length) {
      throw new Error("Vous n'êtes pas autorisé à valider à ce niveau");
    }

    //Mapper la décision utilisateur
    const isAccepted = data.decision === 'accepter';

    //Mapper la décision utilisateur
    let reponse = null;
    if(data.decision == 'accepter'){
        reponse = 'approuve';
    }else if(data.decision == 'refuser'){
        reponse = 'rejete';
    }else{
        reponse = 'revoir'
    }

    const decisionPayload = {
      iddemande: data.iddemande,
      iduser: data.userId,
      motif: data.motif ?? null,
      commentaire: data.comment ?? null,
      decision: reponse
    };

    //Enregistrer la décision
    await demandeModel.save_decision(decisionPayload);

    //Cas REFUS → rejet immédiat
    if (reponse && reponse == 'rejete') {
      await demandeModel.update_statut({
        iddemande: data.iddemande,
        statut: 4 // REJETÉE
      });
      return;
    }


    //Cas COMPLEMENT → complement d'information immédiat
    if (reponse && reponse == 'revoir') {
      await demandeModel.update_statut({
        iddemande: data.iddemande,
        statut: 2 
      });
      return;
    }

    //Cas ACCEPTATION
    const { statut, niveauactuel } = demande[0];

    // première validation → EN COURS
    if (statut === 0 || statut === 2) {
      await demandeModel.update_statut({
        iddemande: data.iddemande,
        statut: 1 // EN COURS
      });
    }

    // vérifier si dernier niveau atteint
    const [{ dernierRang }] = await demandeModel.get_dernierniveau(data.iddemande);

    if (niveauactuel === dernierRang) {
      // validation finale
      await demandeModel.update_statut({
        iddemande: data.iddemande,
        statut: 3 // VALIDÉE
      });
    } else {
      // passer au niveau suivant
      await demandeModel.augNiveauactuel(data.iddemande);
    }

  }

  return {message: "Demande validée" };
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

async function get_validateurCircuit(iddemande){
    if (!iddemande) {
        throw new Error("ID demande requis");
    }

    try {
        const demande_ = await demandeModel.get_validateurCircuit(iddemande);
        return demande_;
    } catch (err) {
        throw err;
    }
}

async function get_detailBudget(iddemande){
    if (!iddemande) {
        throw new Error("ID demande requis");
    }

    let dmd = null;
    try {
        const demande_ = await demandeModel.get_detailBudget(iddemande);
        try {
          const demandes = {};
          for(const row of demande_){
            if(!dmd){
              dmd = {
                iddemande: row.iddemande,
                codedemande: row.codedemande,
                datedemande: row.datedemande,
                decaisse : row.decaisse,
                solde : row.solde,
                statut : row.statut,
                idsite : row.idsite,
                iddepartement : row.iddepartement,
                dept_lib : row.dept_libelle,
                codedept: row.codedept,
                codedevise : row.codedevise,
                totaldemande : 0,
                totalref : 0,
                budget : {
                  idbudget : row.idbudget,
                  codebudget : row.codebudget,
                  libelle : row.libelle,
                  typebudget: row.typebudget,
                  cloture : row.cloture,
                  valide : row.valide,
                  datedebut: row.datedebut,
                  datefin : row.datefin,
                },
                details : []
              }
            }

            //Calcule des valeurs budgetaires
            const preengages = await lignedemandemodel.get_preengageBynature(row.idnature) ;
            const preengage = preengages[0].preengage;
            const engages = await lignedemandemodel.get_engageBynature(row.idnature) ;
            const engage = engages[0].engage;
            const realises = await lignedemandemodel.get_realiseBynature(row.idnature) ;
            const realise = realises[0].realise;

            if(row.idnature){
              if(!demandes[row.idnature]){
                demandes[row.idnature] = {
                  idnature : row.idnature,
                  codenature : row.codenature,
                  nature_lib : row.nature_lib,
                  conso : row.budgetconso,
                  preengage : preengage || 0,
                  engage : engage || 0,
                  realise : realise || 0,
                  prevision : row.montantprevisionsociete,
                  montant_demande : row.montant_demande,
                  montant_ref : row.montant_ref,
                }

                dmd.details.push(demandes[row.idnature])
                dmd.totaldemande += row.montant_demande || 0;
                dmd.totalref += row.montant_ref || 0;
              }
            }
          }
        } catch (error) {
          throw error;
        }
        return dmd;
    } catch (err) {
        throw err;
    }
}

async function getDernierTaux(deviseorigine, devisedestination, date){
  if(!deviseorigine || !devisedestination){
    throw new Error('Données invalides');
  }

  //Récuperer la devise
  let deviseOrigine = null;
  if(deviseorigine){
    deviseOrigine = await deviseservice.getonedevise(deviseorigine);
  }else{
    throw new Error('Dévise inexistante dans la base');
  }

  let deviseDestinat = null;
  if(deviseorigine){
    deviseDestinat = await deviseservice.getonedevise(deviseDestinat);
  }else{
    throw new Error('Dévise inexistante dans la base');
  }

  try {
    const result = await demandeModel.getTauxRecent(deviseorigine, devisedestination, date);
    return result;
  } catch (error) {
    throw error;
  }


}

module.exports = {
  getAll,
  create_demande,
  get_demande_by_id,
  update_demande,
  delete_demande,
  validate,
  get_demandeAvalider,
  get_validateurCircuit,
  get_detailBudget,
  getDernierTaux
};