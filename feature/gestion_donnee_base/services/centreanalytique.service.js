const centreanalytiquemodel = require("../models/centreanalytique.model");
const PaginationModel = require("../../../shared/utils/model");
const { v4: uuidv4 } = require('uuid');

let centre = new centreanalytiquemodel();

let centres = []; 

async function get_allcentres(page = 1, limit = 5) {
    const result = await centre.get_allcentres(page, limit);
    centres = result.data.map(item => new centreanalytiquemodel(
    item.idcentreanalytique,
    item.codecentreanalytique,
    item.libelle,
    item.actif,
    item.idsociete,
    item.createdat, 
    item.updatedat, 
    item.createdby, 
    item.updatedby));
    
  return new PaginationModel(result.page, result.limit, result.total, centres);
}


// OK
async function create_centre(data) {
  if (!data.codecentreanalytique || !data.libelle || !data.actif || !data.idsociete ) {
    throw new Error("Tous les champs sont requis.");
  }

  const today = new Date();

  const newcentre = new centreanalytiquemodel(
    uuidv4(), 
    data.codecentreanalytique,
    data.libelle,
    data.actif, 
    data.idsociete,
    data.createdat || today, 
    data.updatedat || null, 
    data.createdby || 'System',
    data.updatedby || null);

  const recorded = await newcentre.create_centre(newcentre);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }
  return recorded.data;
}


// OK
async function get_by_idcentre(idcentreanalytique) {
  if (!idcentreanalytique) {
    throw new Error("Ce centre analytique n'existe pas.");
  }

  try {
    const centre_ = await centre.get_onecentre(idcentreanalytique);
    return centre_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


async function update_centre(idcentreanalytique, data) {
  if (!idcentreanalytique) {
    throw new Error("Erreur de donnée");
  }

  try {
    const centre_ = await centre.update_centre(idcentreanalytique, data);
    return centre_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
}


async function delete_centre(idcentreanalytique) {
   try {
    const centre_ = await centre.delete_centre(idcentreanalytique);
    if (!centre_.success) {
      throw new Error(centre_.message);
    }
    return centre_;
   } catch (err) {
    console.log(`Aucune donnée: ${err.message}`.cyan.bold);
    throw err;
   }
}


module.exports = {
  get_allcentres,
  get_by_idcentre,
  create_centre,
  update_centre,
  delete_centre
};
