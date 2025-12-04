const utilisateurModel = require("../models/utilisateur.model");
const { v4: uuidv4 } = require('uuid');

let utilisateur = new utilisateurModel();
let utilisateurs = [];

async function get_all_utilisateurs() {
    const result = await utilisateur.get_allutilisateurs();

    utilisateurs = result.recordset.map(item => new utilisateurModel(
        item.idutilisateur,
        item.code,
        item.nom,
        item.prenom,
        item.adresse,
        item.telephone,
        item.email,
        item.typeentitesite,
        item.typeentitedepartement,
        item.typeentitesociete,
        item.acheteur,
        item.iddepartement,
        item.codedept,
        item.idsociete,
        item.codesociete,
        item.createdat,
        item.createdby,
        item.updatedat,
        item.updatedby
    ));

    return utilisateurs;
}

async function create_utilisateur(data) {

    const today = new Date();

    const newUtilisateur = new utilisateurModel(
        uuidv4(),                      
        data.code,
        data.nom,
        data.prenom,
        data.adresse,
        data.telephone,
        data.email,
        data.typeentitesite,
        data.typeentitedepartement,
        data.typeentitesociete,
        data.acheteur,
        data.iddepartement,
        data.codedept,
        data.idsociete,
        data.codesociete,
        data.createdat || today,
        data.createdby || 'System',
        data.updatedat || today,
        data.updatedby || 'System'
    );

    const recorded = await newUtilisateur.create_utilisateurmodel(newUtilisateur);

    if (!recorded.success) {
        throw new Error(recorded.message);
    }

    return recorded;
}

async function get_by_idutilisateur(idutilisateur) {
    if (!idutilisateur) {
        throw new Error("Erreur de donnée");
    }

    try {
        const utilisateur_ = await utilisateur.get_oneutilisateur(idutilisateur);
        return utilisateur_;
    } catch (err) {
        console.log(`Aucune donnée: ${err}`.cyan.bold);
        throw err;
    }
}

async function update_utilisateur(code, data) {
    if (!code) {
        throw new Error("Erreur de donnée");
    }

    try {
        const utilisateur_ = await utilisateur.update_utilisateur(code, data);
        return utilisateur_.recordset;
    } catch (err) {
        console.log(`Erreur de modification: ${err}`.cyan.bold);
        throw err;
    }
}

async function delete_utilisateur(idutilisateur) {
    try {
        const utilisateur_ = await utilisateur.delete_utilisateur(idutilisateur);
        if (!utilisateur_.success) {
            throw new Error(utilisateur_.message);
        }
        return utilisateur_;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    get_all_utilisateurs,
    get_by_idutilisateur,
    create_utilisateur,
    update_utilisateur,
    delete_utilisateur
};
