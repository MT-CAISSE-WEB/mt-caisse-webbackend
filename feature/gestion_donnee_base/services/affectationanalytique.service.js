const affectationanalytiquemodel = require("../models/affectationanalytique.model");
const { v4: uuidv4 } = require('uuid');

const societemodel = require("../../gestion_organisation/models/societe.model");
const sitemodel = require("../../gestion_organisation/models/site.model");
const departementmodel = require("../../gestion_organisation/models/departement.model");
const centreanalytiquemodel = require("../models/centreanalytique.model");
const natureoperationmodel = require("../models/natureoperation.model");

let affectation = new affectationanalytiquemodel();

let affectations = []; 

async function get_all_affectations() {
    const result = await affectation.get_allaffectations();
    affectations = result.data.map(item => new affectationanalytiquemodel(
    item.idaffectation,
    item.codeaffectation,
    item.actif,
    item.idsociete,
    item.idsite,
    item.iddepartement,
    item.idcentreanalytique,
    item.idnature,
    item.createdat, 
    item.updatedat, 
    item.createdby, 
    item.updatedby,

    item.idsociete ? new societemodel(
      item.societe_idsociete, item.societe_codesociete, 
      item.iddevisereference, item.iddevisereporting, 
      item.societe_raisonsociale) : null,

    item.idsite ? new sitemodel(
      item.site_idsite, item.site_idsociete, item.site_codesite, item.site_idcentreanalytique,
      item.site_libellesite) : null,

    item.iddepartement ? new departementmodel(
      item.departement_iddepartement, item.departement_idsociete, 
      item.departement_idsite, item.departement_responsable, 
      item.departement_codedept, item.departement_libelledept) : null,

    item.idcentreanalytique ? new centreanalytiquemodel(
      item.centreanalytique_idcentreanalytique, item.centreanalytique_codecentre, 
      item.centreanalytique_libellecentre) : null,

    item.idnature ? new natureoperationmodel(
      item.nature_idnature, item.natureoperation_codenature, item.natureoperation_libellenature) : null
  ));

  return affectations;

}


// OK
async function create_affectation(data) {
  if ( !data.codeaffectation || !data.actif || !data.idsociete || !data.idsite || !data.iddepartement 
    || !data.idcentreanalytique || !data.idnature ) {
    throw new Error("Tous les champs sont requis.");
  }

  const today = new Date();

  const newaffectation = new affectationanalytiquemodel(
    uuidv4(),
    data.codeaffectation,
    data.actif, 
    data.idsociete,
    data.idsite,
    data.iddepartement,
    data.idcentreanalytique,
    data.idnature,
    data.createdat || today, 
    data.updatedat || null, 
    data.createdby || 'System',
    data.updatedby || null);

  const recorded = await newaffectation.create_affectation(newaffectation);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }
  return recorded.data;
}


// OK
async function get_by_idaffectation(idaffectation) {
  if (!idaffectation) {
    throw new Error("Cette affectation n'existe pas.");
  }

  try {
    const affectation_ = await affectation.get_oneaffectation(idaffectation);
    return affectation_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


async function update_affectation(idaffectation, data) {
  if (!idaffectation) {
    throw new Error("Erreur de donnée");
  }

  try {
    const affectation_ = await affectation.update_affectation(idaffectation, data);
    return affectation_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
}


async function delete_affectation(idaffectation) {
   try {
    const affectation_ = await affectation.delete_affectation(idaffectation);
    if (!affectation_.success) {
      throw new Error(affectation_.message);
    }
    return affectation_;
   } catch (err) {
    console.log(`Aucune donnée: ${err.message}`.cyan.bold);
    throw err;
   }
}


module.exports = {
  get_all_affectations,
  get_by_idaffectation,
  create_affectation,
  update_affectation,
  delete_affectation
};
