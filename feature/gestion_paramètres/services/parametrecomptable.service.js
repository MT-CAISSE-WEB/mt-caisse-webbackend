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
            url: row.urldossier,
            analytiquesite: row.analytiquesite,
            analytiquetable : row.analytiquetable,
            axesecond : row.axesecond
        }));

        return parametres;
    } catch (error) {
        console.log("Erreur lors de la récupération des paramètres comptables:", error);
        throw new Error("Erreur lors de la récupération des paramètres comptables : " + error.message);
    }
}

async function saveAnalytiqueEntiteSite(data) {

    const { societe, entite } = data;
    console.log("data ", data);

    if (!societe) {
        throw new Error("La société est obligatoire.");
    }

    const valeur = entite ? 1 : 0;

    return await parametremodel.updateParametreComptable(
        societe,
        'analytiquesite',
        entite
    );
}

async function saveAxeSecond(data) {

    const { societe, axesecond } = data;

    if (!societe) {
        throw new Error("La société est obligatoire.");
    }

    return await parametremodel.updateParametreComptable(
        societe,
        'axesecond',
        axesecond
    );
}

async function saveAnalytiqueTable(data) {

    const { societe, table } = data;

    if (!societe) {
        throw new Error("La société est obligatoire.");
    }

    return await parametremodel.updateParametreComptable(
        societe,
        'analytiquetable',
        table
    );
}

async function findAllcorrespondance() {
    return await parametremodel.findAllCorrespondance();
}

async function findCorrespondanceById(id) {
    const item = await parametremodel.findById(id);
    if (!item) {
        throw new Error('Correspondance non trouvée');
    }
    return item;
}

async function createCorrespondance(data, userId) {

    // Validation des champs
    if (!data.idcentreanalytique) {
        throw new Error("Le centre analytique est obligatoire.");
    }

    if (!data.correspondance?.trim()) {
        throw new Error("La correspondance est obligatoire.");
    }

    // Vérifier doublon sur le centre analytique
    const correspondanceCentre =
        await parametremodel.getCorrespondanceByCentre(
            data.idcentreanalytique
        );

    if (correspondanceCentre){
        throw new Error(
            "Une correspondance existe déjà pour ce centre analytique."
        );
    }

    const payload = {
        idcorrespondance: uuidv4(),
        idcentreanalytique: data.idcentreanalytique,
        correspondance: data.correspondance.trim(),
        actif: 1
    };

    return await parametremodel.createCorrespondance(
        payload,
        userId
    );
}

async function updateCorrespondance(id, data, userId) {
    const existing = await parametremodel.findById(id);
    if (!existing) {
        throw new Error('Correspondance non trouvée');
    }

    return await parametremodel.updateCorrespondance(id, data, userId);
}

async function hardDeleteCorrespondance(id) {
    const existing = await parametremodel.findById(id);
    if (!existing) {
        throw new Error('Correspondance non trouvée');
    }

    return await parametremodel.hardDelete(id);
}


module.exports = {
    save,
    getall,
    hardDeleteCorrespondance,
    updateCorrespondance,
    findAllcorrespondance,
    findCorrespondanceById,
    createCorrespondance,
    saveAnalytiqueEntiteSite,
    saveAnalytiqueTable,
    saveAxeSecond
}