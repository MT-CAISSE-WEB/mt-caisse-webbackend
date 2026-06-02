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
    data.demande ? data.demande : null, 
    data.societe,
    data.site,
    data.devise,
    devise.data.codedevise,
    datePeriode,
    data.montant,
    data.tauxoperation || 1,
    data.typepaiement || null,
    data.beneficiaire || null,
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
      dateoperation: new Date(),
      montant: data.montant,
      tauxoperation: data.tauxoperation,
      createdby: data.createdby || 'SYSTEM',

      // traçabilité
      idoperationorigine: data.idoperation,
      libelleannulation: `Annulation - ${data.codeoperation}`
    };

    const enteteoperation =
      await create_enteteoperation(
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
    await update_status(
      data.idoperation,
      {
        annulee: 1,
        updatedat: today,
        updatedby: data.createdby || 'SYSTEM'
      }
    );

    return enteteoperation;

  } catch (err) {
    throw err;
  }
}

async function update_status(identeteoperation, data) {
  if (!identeteoperation) {
    throw new Error("Erreur de donnée");
  }

  try {
    const enteteoperation_ = await enteteoperation.update_status(identeteoperation, data);
    return enteteoperation_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function update_operationorigine(identeteoperation, data) {
  if (!data.idoperationorigine) {
    throw new Error("Erreur de donnée");
  }

  try {
    const enteteoperation_ = await enteteoperation.update_operationorigine(identeteoperation, data);
    return enteteoperation_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

module.exports = {
  get_all_enteteoperations,
  get_by_identeteoperation,
  create_enteteoperation,
  cancel_enteteoperation,
  update_enteteoperation,
  update_status,
  update_operationorigine,
  delete_enteteoperation
};
