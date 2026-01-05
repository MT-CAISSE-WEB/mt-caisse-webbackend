const utilisateurcaissemodel = require("../models/utilisateurcaisse.model");
const { v4: uuidv4 } = require('uuid');
const societemodel = require("../../gestion_organisation/models/societe.model");
const utilisateurmodel = require("../../gestion_users/models/users.model");
const caisseModel = require("../models/caisse.model");
const PaginationModel = require("../../../shared/utils/model");
let utilisateurcaisse = new utilisateurcaissemodel();
let caissemodel = new caisseModel();
let utilisateurcaisses = [];

async function get_all_utilisateurcaisses({page, limit , search, actif}) {
  const result = await utilisateurcaisse.get_allutilisateurcaisses({page, limit , search, actif});
  try {
    utilisateurcaisses = result.data.map(item => new utilisateurcaissemodel(
      item.idutilisateurcaisse,
      item.idcaisse, 
      item.codecaisse, 
      item.idutilisateur,
      item.idsociete,
      item.actif, 
      item.createdat, 
      item.createdby, 
      item.updatedat,  
      item.updatedby,
      item.caisse ? new caisseModel(item.caisse_idcaisse, item.caisse_codecaisse,item.caisse_libelle,item.caisse_idjournal,item.caisse_iddevise,item.caisse_idsite,item.caisse_idsociete,item.caisse_idcompte,item.caisse_actif,item.caisse_createdat,item.caisse_createdby, null, null) : null,
      item.utilisateur ? new utilisateurmodel(item.user_idutilisateur,item.user_codeutilisateur,item.user_idsociete,item.user_nom,item.user_prenom,item.user_adresse,item.user_telephone,item.user_email,null, null, item.user_typeentitesite,item.user_typeentitedepartement,item.user_typeentitesociete,item.user_acheteur, null, null, null, null) : null,
      item.societe ? new societemodel(
        item.societe_idsociete, item.societe_codesociete, item.societe_raisonsociale, item.societe_rccm, item.societe_numnui, item.societe_email, item.societe_telephone, item.societe_logo, item.societe_adresse, item.societe_suivibudgetaire, item.societe_createdat, item.societe_updatedat, item.societe_createdby, item.societe_updatedby
      ) : null,
    ));
  } catch (error) {
    console.log(error);
  }
  
  return new PaginationModel(result.page, result.limit, result.total, utilisateurcaisses);
}

async function create_utilisateurcaisse(data) {
  if (!data.idcaisse && !data.idutilisateur) {
    throw new Error("Tous les champs (codecaisse, codeutilisateur) sont requis.");
  }

  const today = new Date();
  const newutilisateurcaisse = new utilisateurcaissemodel(
    uuidv4(), 
    data.idcaisse,  
    data.codecaisse || null, 
    data.idutilisateur, 
    data.idsociete,
    data.actif,
    data.createdat || today, 
    data.createdby || 'System', 
    data.updatedat, 
    data.updatedby);
  const recorded = await newutilisateurcaisse.create_utilisateurcaissemodel(newutilisateurcaisse);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }

  return recorded;
}

async function get_by_idutilisateurcaisse(idutilisateurcaisse) {
  if (!idutilisateurcaisse) {
    throw new Error("Erreur de donnée");
  }

  try {
    const utilisateurcaisse_ = await utilisateurcaisse.get_oneutilisateurcaisse(idutilisateurcaisse);
    return utilisateurcaisse_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function get_caisseByuser(idutilisateur) {
  if (!idutilisateur) {
    throw new Error("Erreur de donnée");
  }

  try {
    const rows = await utilisateurcaisse.get_caisseByUser(idutilisateur);

    if (!rows || rows.length === 0) {
      return [];
    }

    const utilisateurcaisses = await Promise.all(
      rows.map(async (row) => {
        const caisse = await caissemodel.get_onecaisse(row.idcaisse);

        return {
          idutilisateurcaisse: row.idutilisateurcaisse,
          idcaisse: row.idcaisse,
          codecaisse: row.codecaisse,
          idutilisateur: row.idutilisateur,
          idsociete: row.idsociete,
          actif: row.actif,
          createdat: row.createdat,
          createdby: row.createdby,
          updatedat: row.updatedat,
          updatedby: row.updatedby,
          caisse
        };
      })
    );

    return utilisateurcaisses;

  } catch (error) {
    console.error("Erreur récupération caisses utilisateur :", error);
    throw error;
  }

}

async function update_utilisateurcaisse(idutilisateurcaisse, data) {
  if (!idutilisateurcaisse || !data.idcaisse || !data.idutilisateur) {
    throw new Error("Erreur de donnée");
  }

  try {
    const utilisateurcaisse_ = await utilisateurcaisse.update_utilisateurcaisse(idutilisateurcaisse, data);
    return utilisateurcaisse_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function delete_utilisateurcaisse(idutilisateurcaisse) {
   try {
    const utilisateurcaisse_ = await utilisateurcaisse.delete_utilisateurcaisse(idutilisateurcaisse);
    if (!utilisateurcaisse_.success) {
      throw new Error(utilisateurcaisse_.message);
    }
    return utilisateurcaisse_;
   } catch (err) {
    throw err;
   }
}

async function get_caissePeriodeByUser(idutilisateur) {
  if (!idutilisateur) {
    throw new Error("Erreur de donnée");
  }

  try {
    const rows = await utilisateurcaisse.get_caissePeriodeByUser(idutilisateur);
    if (!rows || rows.length === 0) {
      return [];
    }

    const utilisateurcaisses = rows.map(row => ({
      idutilisateurcaisse: row.idutilisateurcaisse,
      actif: row.utilisateurcaisse_actif,

      caisse: {
        idcaisse: row.idcaisse,
        codecaisse: row.codecaisse,
        libelle: row.libellecaisse,
        iddevise: row.iddevise,
        codedevise : row.codedevise,
        codeiso : row.codeiso,
        intitule : row.intitule,
        idsite: row.idsite,
        idsociete: row.idsociete,
        soldeinitialisation: row.soldeinitialisation,
        seuilminimal: row.seuilmnimal,
        actif: row.caisse_actif
      },

      dernierePeriode: row.idperiode ? {
        idperiode: row.idperiode,
        dateperiode: row.dateperiode,
        soldeouverture: row.soldeouverture,
        soldefermeture: row.soldefermeture,
        montantphysique: row.montantphysique,
        ecart: row.ecart,
        statut: row.statutperiode
      } : null
    }));

    return utilisateurcaisses;

  } catch (error) {
    console.error("Erreur récupération de la période caisses de utilisateur :", error);
    throw error;
  }

}

module.exports = {
  get_all_utilisateurcaisses,
  get_by_idutilisateurcaisse,
  create_utilisateurcaisse,
  update_utilisateurcaisse,
  delete_utilisateurcaisse,
  get_caisseByuser,
  get_caissePeriodeByUser
};
