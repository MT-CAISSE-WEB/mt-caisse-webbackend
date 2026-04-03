const PiecejointeModel = require('../models/piecejointe.model');
const { v4: uuidv4 } = require('uuid');
let pjmodel = new PiecejointeModel();
const PaginationModel = require("../../../shared/utils/model");

async function create(data){
    if (!data.idtable || !data.urlpiece) {
        throw new Error("Tous les champs (urlpiece, idtable) sont requis.");
    }

    const piecejointe = new PiecejointeModel( uuidv4(), data.urlpiece ,data.nomtable ,data.idtable ,data.dossier, new Date(), data.createdby || 'System', null, null );
    const recorded = await piecejointe.create_piecejointe(piecejointe);
    // si le modèle renvoie une erreur
    if (!recorded.success) {
        throw new Error(recorded.message);
    }

    return recorded.data;
}

async function getall(params){
    const result = await pjmodel.get_allpiecejointes(params);
    piecejointes = result.data.map(item => new pjmodel(
        item.idpiecejointe, item.urlpiece, item.nomtable ,item.idtable ,item.dossier, item.createdat, item.createdby, item.updatedat, item.updatedby));

  return new PaginationModel(result.page, result.limit, result.total, piecejointes);
}

// async function getOne(idmodelepiecejointe) {
//     if (!idmodelepiecejointe) {
//         throw new Error("Erreur de donnée");
//     }

//     try {
//         const piecejointe = await pjmodel.get_onepiecejointe(idmodelepiecejointe);
//         return piecejointe;
//     } catch (err) {
//         console.log(`Aucune donnée: ${err}`.cyan.bold);
//         throw err;
//     }
// }

// async function update(idpiecejointe, data) {
//   if (!idpiecejointe || !data.codemodelepiecejointe) {
//     throw new Error("Erreur de donnée");
//   }

//   try {
//     const piecejointe = await pjmodel.update(data.codemodelepiecejointe, data);
//     return piecejointe.recordset;
//   } catch (err) {
//     console.log(`Erreur de modification: ${err}`.cyan.bold);
//     throw err;
//   }
// }

async function delete_piecejointe(idpiecejointe) {
    if (!idpiecejointe) {
        throw new Error("Erreur de donnée");
    }

    try {
        const piecejointe = await pjmodel.delete_piecejointe(idpiecejointe);
        if (!piecejointe.success) {
            throw new Error(piecejointe.message);
        }
        return piecejointe;
    } catch (err) {
        throw err;
    }
}

module.exports = {
  create,
  getall,
  delete_piecejointe
};
