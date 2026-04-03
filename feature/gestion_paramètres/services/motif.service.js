const MotifModel = require('../models/motif.model');
const { v4: uuidv4 } = require('uuid');
let motifmodel = new MotifModel();
const PaginationModel = require("../../../shared/utils/model");

async function create(data){
    if (!data.libellemotif || !data.codemotif) {
        throw new Error("Tous les champs (libelle, code) sont requis.");
    }

    const motif = new MotifModel( uuidv4(), data.codemotif, data.libellemotif, new Date(), data.createdby || 'System', null, null );

    const recorded = await motif.create_motif(motif);
    // si le modèle renvoie une erreur
    if (!recorded.success) {
        throw new Error(recorded.message);
    }

    return recorded.data;
}

async function getall(params){
    const result = await motifmodel.get_allmotifs(params);
    motifs = result.data.map(item => new MotifModel(
        item.idmotif, item.codemotif, item.libellemotif, item.createdat, item.createdby, item.updatedat, item.updatedby,
    ));

  return new PaginationModel(result.page, result.limit, result.total, motifs);
}

async function getOne(idmotif) {
    if (!idmotif) {
        throw new Error("Erreur de donnée");
    }

    try {
        const motif = await motifmodel.get_onemotif(idmotif);
        return motif;
    } catch (err) {
        console.log(`Aucune donnée: ${err}`.cyan.bold);
        throw err;
    }
}

async function update(idmotif, data) {
  if (!idmotif || !data.codemotif) {
    throw new Error("Erreur de donnée");
  }

  try {
    const motif = await motifmodel.update(data.codemotif, data);
    return motif.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function delete_motif(idmotif) {
    if (!idmotif) {
        throw new Error("Erreur de donnée");
    }

    try {
        const motif = await motifmodel.delete_motif(idmotif);
        if (!motif.success) {
            throw new Error(motif.message);
        }
        return motif;
    } catch (err) {
        throw err;
    }
}

module.exports = {
  create,
  getall,
  getOne,
  update,
  delete_motif
};
