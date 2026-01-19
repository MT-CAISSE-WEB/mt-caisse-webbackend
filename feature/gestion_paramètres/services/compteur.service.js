const CompteurModel = require('../models/compteur.model');
const { v4: uuidv4 } = require('uuid');
let compteurmodel = new CompteurModel();
const PaginationModel = require("../../../shared/utils/model");

async function create(data){
    if (!data.libelle || !data.codemodelecompteur) {
        throw new Error("Tous les champs (libelle, codemodelecompteur) sont requis.");
    }

    const compteur = new CompteurModel( uuidv4(), data.codemodelecompteur ,data.libelle ,data.typedocument ,data.sequence_1 ,data.prefixe_1 ,data.sequence_2 ,data.prefixe_2, new Date(), data.createdby || 'System', null, null );
    const recorded = await compteur.create_compteur(compteur);
    // si le modèle renvoie une erreur
    if (!recorded.success) {
        throw new Error(recorded.message);
    }

    return recorded.data;
}

async function getall(params){
    const result = await compteurmodel.get_allcompteurs(params);
    compteurs = result.data.map(item => new CompteurModel(
        item.idmodelecompteur, item.codemodelecompteur, item.libelle ,item.typedocument ,item.sequence_1 ,item.prefixe_1 ,item.sequence_2 ,item.prefixe_2, item.createdat, item.createdby, item.updatedat, item.updatedby,
    ));

  return new PaginationModel(result.page, result.limit, result.total, compteurs);
}

async function getOne(idmodelecompteur) {
    if (!idmodelecompteur) {
        throw new Error("Erreur de donnée");
    }

    try {
        const compteur = await compteurmodel.get_onecompteur(idmodelecompteur);
        return compteur;
    } catch (err) {
        console.log(`Aucune donnée: ${err}`.cyan.bold);
        throw err;
    }
}

async function update(idcompteur, data) {
  if (!idcompteur || !data.codemodelecompteur) {
    throw new Error("Erreur de donnée");
  }

  try {
    const compteur = await compteurmodel.update(data.codemodelecompteur, data);
    return compteur.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function delete_compteur(idcompteur) {
    if (!idcompteur) {
        throw new Error("Erreur de donnée");
    }

    try {
        const compteur = await compteurmodel.delete_compteur(idcompteur);
        if (!compteur.success) {
            throw new Error(compteur.message);
        }
        return compteur;
    } catch (err) {
        throw err;
    }
}

module.exports = {
  create,
  getall,
  getOne,
  update,
  delete_compteur
};
