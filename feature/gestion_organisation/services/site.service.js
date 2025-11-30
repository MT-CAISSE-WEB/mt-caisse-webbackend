const sitemodel = require("../models/site.model");
const { v4: uuidv4 } = require('uuid');

let site = new sitemodel();
let sites = [];

async function get_all_sites() {
  const result = await site.get_allsites();
  sites = result.recordset.map(item => new sitemodel(
    item.idsite,
    item.codesite,
    item.libelle,
    item.email,
    item.telephone,
    item.adresse,
    item.idsociete,
    item.createdat,
    item.updatedat,
    item.createdby,
    item.updatedby));
  return sites;
}


async function create_site(data) {
  if (!data.code && !data.raisonsociale && !data.rccm && !data.numNUI && !data.email
     && !data.telephone && !data.logo && !data.adresse && !data.suivibudgetaire) {
    throw new Error("Tous les champs sont requis.");
  }

  const today = new Date();
  const newsite = new sitemodel(
    uuidv4(), 
    data.code, 
    data.raisonsociale, 
    data.rccm, 
    data.numNUI, 
    data.email, 
    data.telephone, 
    data.logo, 
    data.adresse, 
    data.suivibudgetaire, 
    data.createdAt || today, 
    data.updatedAt || today, 
    data.createdBy || 'System', 
    data.updatedBy || 'System');
  const recorded = await newsite.create_sitemodel(newsite);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }

  return recorded;
}

async function get_by_idsite(idsite) {
  if (!idsite) {
    throw new Error("Société non trouvée.");
  }
  
  try {
    const site_ = await site.get_onesite(idsite);
    return site_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function update_site(idsite, data) {
  if (!idsite) {
    throw new Error("Erreur de donnée");
  }

  try {
    const site_ = await site.update_site(data.idsite, data);
    return site_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function delete_site(idsite) {
   try {
    const site_ = await site.delete_site(idsite);
    if (!site_.success) {
      throw new Error(site_.message);
    }
    return site_;
   } catch (err) {
    throw err;
   }
}

module.exports = {
  get_all_sites,
  get_by_idsite,
  create_site,
  update_site,
  delete_site
};
