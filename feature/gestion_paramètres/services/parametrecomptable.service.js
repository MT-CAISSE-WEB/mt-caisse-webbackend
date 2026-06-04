const ParametreComptableModel = require('../models/parametrecomptable.model');
const { v4: uuidv4 } = require('uuid');
let parametremodel = new ParametreComptableModel();
const PaginationModel = require("../../../shared/utils/model");


async function save(data){
    if (!data.value || !data.societe) {
        throw new Error("Tous les champs (valeur, societe) sont requis.");
    }

    const recorded = await parametremodel.save(data);
    // si le modèle renvoie une erreur
    if (!recorded.success) {
        throw new Error(recorded.message);
    }

    return recorded.data;
}


async function getall(data){
    if (!data.societe) {
        throw new Error("Société de utilisateur inexistante dans la base.");
    }

    try {
        const result = await parametremodel.get_parametrecomptable_bysociete(data.societe);
        
        // Transformation des données
        const parametres = result.map(row => ({
            societe: {
                id: row.idsociete,
                code: row.codesociete,
                raisonSociale: row.raisonsociale
            },
            journal: row.idjournal ? {
                id: row.idjournal,
                code: row.codejournal,
                designation: row.journal_designation
            } : null,
            compte: row.idcompte ? {
                id: row.idcompte,
                numero: row.numcompte,
                libelle: row.compte_libelle
            } : null,
            url: row.urldossier
        }));

        return parametres;
    } catch (error) {
        console.log("Erreur lors de la récupération des paramètres comptables:", error);
        throw new Error("Erreur lors de la récupération des paramètres comptables : " + error.message);
    }
}


module.exports = {
    save,
    getall
}