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
const userservice = require("../../gestion_users/services/users.service")
const enteteDemandeModel = require("../../gestion_demande_decaissement/models/entetedemande.model");
let demandemodel = new enteteDemandeModel();
const ecritureservice = require("../../gestion_comptabilisation/services/ecriture.service");

let typeoperation = new typeoperationmodel();
let typeoperations = [];

async function get_all_typeoperations({page, limit, search, date, user, typepaiement, devise}) {

  //Récuperer les data de l'utilisateur connecté
  const userconnect = await userservice.getoneuser(user);

  let soldes = [];
  soldes = await typeoperation.get_soldecaisse();
  const result = await typeoperation.get_alltypeoperations({ page, limit, search, date, typepaiement, devise }, userconnect.data);

  console.log(result);

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
              idoperationorigine: row.idoperationorigine,
              idoperationannulation: row.idoperationannulation,
              idsociete : row.idsociete,
              idsite : row.idsite,
              iddevise : row.iddevise,
              montant : row.montant,
              tauxoperation : row.tauxoperation,
              typeoperation : row.typeoperation,
              beneficiaire : row.beneficiaire,
              justifiee : row.justifiee,
              annulee : row.annulee,
              createdat: row.createdat,
              createdby: row.createdby,
              updatedat: row.updatedat,
              updatedby: row.updatedby,
              lignes: [],
              caisses: [],
              ecritures: [],
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
                      idcompte: row.nature_idcompte,
                      typeoperation: row.nature_typeoperation
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
      // Construction des écritures
      // ---------------------------
      if (row.idligneecriture) {

          // rechercher la pièce comptable
          let ecriture = op.ecritures.find(
              e => e.refecriture === row.ref_ecriture
          );

          // créer si inexistant
          if (!ecriture) {
              ecriture = {
                  refecriture: row.ref_ecriture,
                  numpiece: row.num_piece,
                  journal: row.journal,
                  dateoperation: row.date_operation,
                  lignes: []
              };

              op.ecritures.push(ecriture);
          }

          // éviter doublon ligne
          const ligneExists = ecriture.lignes.find(
              l => l.idligneecriture === row.idligneecriture
          );

          if (!ligneExists) {
              ecriture.lignes.push({
                  idligneecriture: row.idligneecriture,
                  numligne: row.numligne,
                  typeecriture: row.typeecriture,
                  etat: row.etat,

                  compte: row.idcompte ? {
                      idcompte: row.idcompte,
                      compte: row.compte
                  } : null,

                  tiers: row.idtiers ? {
                      idtiers: row.idtiers,
                      tiers: row.tiers
                  } : null,

                  centreanalytique:
                      row.idcentreanalytique ? {
                          idcentreanalytique:
                              row.idcentreanalytique,
                          centreanalytique:
                              row.centreanalytique
                      } : null,

                  libelle: row.libelle,

                  debit: Number(row.debit || 0),
                  credit: Number(row.credit || 0),
                  montant: Number(row.montant_ecriture || 0),

                  devise: row.iddevise ? {
                      iddevise: row.iddevise,
                      devise: row.devise
                  } : null
              });
          }
      }

      // ---------------------------
      // Construction des types
      // ---------------------------
      if (row.type_idtypeoperation) {
          const exists = op.caisses.find(t => t.idtypeoperation === row.type_idtypeoperation);
          if (!exists) {
            const soldeItem = soldes.find(s => s.idcaisse === row.type_idcaisse);
            const solde = soldeItem ? soldeItem.solde : 0;
              op.caisses.push({
                  idtypeoperation: row.type_idtypeoperation,
                  codtypeoperation: row.type_codtypeoperation,
                  montant: row.type_montant,
                  idcaisse: row.type_idcaisse,
                  taux : row.type_taux,
                  montantref: row.type_montantref,
                  solde : solde,
                  caisse: row.caisse_idcaisse ? {
                      devise: row.devise_caisse,
                      codecaisse: row.caisse_codecaisse,
                      libelle: row.caisse_libelle
                  } : null
              });
          }
      }
    });
    // Convertit en tableau
    typeoperations = Object.values(operations);
  } catch (error) {
    throw new Error(error);
  }

  return new PaginationModel(result.page, result.limit, result.total, typeoperations);
}

async function create_typeoperation(data) {
  const today = new Date();

  if (!Array.isArray(data.caisses) || data.caisses.length === 0) {
    throw new Error("Aucune caisse fournie.");
  }

  //Récuperer la societe
  let societe = null;
  if(data.societe){
    try {
      societe = await societeservice.getonesociete(data.societe);
    } catch (error) {
      throw new Error(error);
    }
  }else{
    throw new Error("Societe de utilisateur invalide");
  }
  
  //Récuperer le site
  let site = null;
  if(data.site){
    try {
      site = await siteservice.getonesite(data.site);
    } catch (error) {
      throw new Error(error);
    }
  }else{
    throw new Error("Site de utilisateur invalide");
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
    const dataligne = {idoperation : enteteoperation.idoperation, idnature: ligne.natureop, idcentre: ligne.centre, idtiers: ligne.tiers, libelle: data.libelle, montantoperation: Number(ligne.montantligne), createdby: ligne.created};
    try {
      const ligneoperation = await ligneoperationservice.create_ligneoperation(dataligne);
    } catch (error) {
      throw new Error(error);
    }
  }

  for (const caisse of data.caisses){
    if(caisse.montantcaisse && Number(caisse.montantcaisse) != 0){
      let caisse1 = null;
      try {
        caisse1 = await caisseservice.get_by_idcaisse(caisse.idcaisse);
      } catch (error) {
        throw new Error(error);
      }
      
      const newtypeoperation1 = new typeoperationmodel( uuidv4(), data.typepaiement, enteteoperation.idoperation, caisse.idperiode, societe.data.idsociete ? societe.data.idsociete : null, site.data.idsite ? site.data.idsite : null, caisse1.idcaisse ? caisse1.idcaisse : null, 
      Number(caisse.montantcaisse), caisse.taux, caisse.montantref, data.createdat || today, data.createdby || 'System', data.updatedat, data.updatedby);
      let recorded1 = null;
  
      try {
        recorded1 = await newtypeoperation1.create_typeoperationmodel(newtypeoperation1);
      } catch (error) {
        throw new Error(error);
      }
      
      // si le modèle renvoie une erreur
      if (!recorded1.success) {
        throw new Error(recorded1.message);
      }
    }
  }

  if(data.demande !== undefined && data.demande !== null && data.demande !== ''){
    try {
      const decaisse = await demandemodel.decaisse_enteteDemande(data.demande, 1);
    } catch (error) {
      throw new Error(error);
    }
  }

  if(enteteoperation){
    try {
      await ecritureservice.GenererEcriture(enteteoperation.idoperation);
    } catch (error) {
      throw new Error(error);
    }
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
  if (!idtypeoperation || !data.codeoperation) {
    throw new Error("Erreur de donnée");
  }

  if (!Array.isArray(data.caisses) || data.caisses.length === 0) {
    throw new Error("Aucune caisse fournie.");
  }

  //Récuperer la societe
  let societe = null;
  if(data.societe){
    try {
      societe = await societeservice.getonesociete(data.societe);
    } catch (error) {
      throw new Error("Erreur societe fournie.");
    }
  }
  
  //Récuperer le site
  let site = null;
  if(data.site){
    try {
      site = await siteservice.getonesite(data.site);
    } catch (error) {
      throw new Error("Erreur site fournie.");
    }
  }

  if (!Array.isArray(data.lignes) || data.lignes.length === 0) {
    throw new Error("Aucune ligne fournie.");
  }

  for (const ligne of data.lignes){
    const dataligne = {idoperation : data.idoperation, idnature: ligne.natureop, idcentre: ligne.centre, idtiers: ligne.tiers, montantoperation: Number(ligne.montantligne), updatedby: ligne.updatedby};
    try {
      const ligneoperation = await ligneoperationservice.update_ligneoperation(ligne.idligne, dataligne);
    } catch (error) {
      console.log(error);
    }
  }

  for (const caisse of data.caisses){
    if(caisse.montantcaisse && Number(caisse.montantcaisse) != 0){
      let caisse1 = null;
      try {
        caisse1 = await caisseservice.get_by_idcaisse(caisse.idcaisse);
      } catch (error) {
        console.log(error);
      }
      const newtypeoperation1 = new typeoperationmodel(caisse.idtypeoperation, data.typepaiement, data.idoperation, caisse.idperiode, data.idsociete, data.idsite, caisse1.idcaisse ? caisse1.idcaisse : null, 
      Number(caisse.montantcaisse), caisse.taux, caisse.montantref, data.createdat, data.createdby, data.updatedat, data.updatedby || null);
      let recorded1 = null;
      try {
        recorded1 = await newtypeoperation1.update_typeoperation(caisse.idtypeoperation, newtypeoperation1);
      } catch (error) {
        console.log(error);
      }
      
    }
  }

  try {
    let enteteoperation = null;
    enteteoperation = await enteteoperationservice.get_by_identeteoperation(data.idoperation);
    return enteteoperation;
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

async function get_soldecaisse() {
   try {
    const typeoperation_ = await typeoperation.get_soldecaisse();
    return typeoperation_;
   } catch (err) {
    throw err;
   }
}

async function get_operationmax() {
   try {
    const typeoperation_ = await typeoperation.get_operationmax();
    const operations = await Promise.all(
        typeoperation_.map(async item => {
            const devise = item.iddevise 
                ? (await deviseservice.getonedevise(item.iddevise)).data 
                : null;

            return {
                idtypeoperation: item.idtypeoperation,
                codtypeoperation: item.codtypeoperation,
                idcaisse: item.idcaisse,
                devise: devise,
                idperiode: item.idperiode,
                montant: item.montant,
                taux: item.taux,
                montantref: item.montantref,
                dateperiode: item.dateperiode,
                codeoperation: item.codeoperation,
                dateoperation: item.dateoperation
            };
        })
    );

    return operations;
   } catch (err) {
    throw err;
   }
}

async function getDataRecu(idoperation){

  if (!idoperation) {
    throw new Error("Erreur de donnée");
  }

  try {
    const rows = await typeoperation.get_dataReçuPdf(idoperation);
    if(!rows.length){
      throw new Error('Aucune donnée pour ce reçu');
    }

    const head = rows[0];

    // Get total ligne
    const total = rows.reduce((sum, r) => sum + (r.montantoperation || 0), 0);
    const caissesMap = {};

    rows.forEach(r => {
      if (!caissesMap[r.caisse]) {
          caissesMap[r.caisse] =  {
            libelle: r.caisse,
            montant: r.montantpaye ?? 0,
            devise: r.devisecaisse
          };
        }
    });

    // Construction d'objet final
    const data = {
      societe: head.societe,
      site : head.site,
      numero: head.numero,
      date: new Date(head.dateoperation).toLocaleDateString('fr-FR'),
      devise: head.deviseoperation, 
      description: head.libelleoperation,
      soldeouverture: head.soldeouverture,
      soldefermeture: head.soldefermeture,
      total,
      type : head.typeoperation,

      lignes: rows.map(r => ({
          libelle: r.nature,
          montant: r.montantoperation
      })),

      caisses: Object.values(caissesMap)

      // caisses: rows.map(r => ({
      //   libelle: r.caisse,
      //   montant: r.montantpaye,
      //   devise: r.devisecaisse   //ajouté
      // }))
    }

    return data;
   } catch (err) {
     throw err;
   }
}

async function cancel_enteteoperation(data) {
  const today = new Date();

  try {
    if (!data?.idoperation) {
      throw new Error("Opération invalide.");
    }

    if (!Array.isArray(data.caisses) || data.caisses.length === 0) {
      throw new Error("Aucune caisse fournie.");
    }

    if (!Array.isArray(data.lignes) || data.lignes.length === 0) {
      throw new Error("Aucune ligne d'opération fournie.");
    }

    /* ======================================================
       1. Déterminer le type inverse
    ====================================================== */
    let nouveauTypePaiement = null;

    switch ((data.caisses[0]?.codtypeoperation || '').toLowerCase()) {
      case 'encaissement':
        nouveauTypePaiement = 'decaissement';
        break;

      case 'decaissement':
      case 'decaissementaj':
        nouveauTypePaiement = 'encaissement';
        break;

      default:
        throw new Error("Type de paiement non reconnu.");
    }

    /* ======================================================
       2. Création de l'entête inverse
    ====================================================== */
    const newEnteteData = {
      codeoperation: null, // nouveau compteur
      demande: data.demande || null,
      societe: data.idsociete,
      site: data.idsite,
      devise: data.iddevise,
      dateoperation: new Date(data.dateoperation),
      montant: data.montant,
      tauxoperation: data.tauxoperation,
      createdby: data.createdby || 'SYSTEM',

      // traçabilité
      idoperationorigine: data.idoperation,
      libelleannulation: `Annulation - ${data.codeoperation}`
    };

    const enteteoperation =
      await enteteoperationservice.create_enteteoperation(
        newEnteteData
      );

    if (!enteteoperation?.idoperation) {
      throw new Error(
        "Échec de création de l'opération d'annulation."
      );
    }

    /* ======================================================
       3. Duplication des lignes
    ====================================================== */
    for (const ligne of data.lignes) {
      const dataligne = {
        idoperation: enteteoperation.idoperation,
        idnature: ligne.nature?.idnature || null,
        idcentre: ligne.centre?.idcentre || null,
        idtiers: ligne.tiers?.idtiers || null,
        libelle: `Annulation - ${ligne.libelle}`,
        montantoperation: Number(ligne.montantoperation),
        createdby: data.createdby || 'SYSTEM'
      };

      await ligneoperationservice.create_ligneoperation(
        dataligne
      );
    }

    /* ======================================================
       4. Création type opération inverse
    ====================================================== */
    for (const caisse of data.caisses) {
      if (
        caisse.montant &&
        Number(caisse.montant) !== 0
      ) {
        const caisse1 =
          await caisseservice.get_by_idcaisse(
            caisse.idcaisse
          );

        const newtypeoperation =
          new typeoperationmodel(
            uuidv4(),
            nouveauTypePaiement,
            enteteoperation.idoperation,
            caisse.idperiode || null,
            data.idsociete,
            data.idsite,
            caisse1?.idcaisse || null,
            Number(caisse.montant),
            caisse.taux,
            caisse.montantref,
            today,
            data.createdby || 'SYSTEM',
            null,
            null
          );

        const recorded =
          await newtypeoperation.create_typeoperationmodel(
            newtypeoperation
          );

        if (!recorded.success) {
          throw new Error(recorded.message);
        }
      }
    }

    /* ======================================================
       5. Génération écriture comptable
    ====================================================== */
    await ecritureservice.GenererEcriture(
      enteteoperation.idoperation
    );

    /* ======================================================
       6. Marquer l'opération source annulée
       (optionnel mais recommandé)
    ====================================================== */

    await enteteoperationservice.update_status(
      data.idoperation,
      {
        annulee: 1,
        idoperationannulation: enteteoperation.idoperation,
        updatedat: today,
        updatedby: data.createdby || 'SYSTEM'
      }
    );

    await enteteoperationservice.update_operationorigine(
      enteteoperation.idoperation,
      {
        idoperationorigine: data.idoperation,
        updatedat: today,
        updatedby: data.createdby || 'SYSTEM'
      }
    );

    return enteteoperation;

  } catch (err) {
    throw err;
  }
}

module.exports = {
  get_all_typeoperations,
  get_by_idtypeoperation,
  create_typeoperation,
  update_typeoperation,
  delete_typeoperation,
  get_soldecaisse,
  cancel_enteteoperation,
  get_operationmax,
  getDataRecu
};
