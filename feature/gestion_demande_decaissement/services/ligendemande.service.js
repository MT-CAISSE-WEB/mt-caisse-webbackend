const { v4: uuidv4 } = require('uuid');
const PaginationModel = require("../../../shared/utils/model");
const deviseservice = require("../../gestion_organisation/services/devise.service");
const societeservice = require("../../gestion_organisation/services/societe.service");
const siteservice = require("../../gestion_organisation/services/site.service");
const ligneDemandeModel = require("../models/lignedemande.model");
const enteteDemandeModel = require("../models/entetedemande.model");

let ligneModel = new ligneDemandeModel();
let enteteDemande = new enteteDemandeModel();
let demandes = [];

async function create_lignedemande(data) {
    const today = new Date();

    if(!data.iddemande || !data.montantdemande){
        throw new Error("Ligne sans entête, sans montant.");
    }

    let entetedemande = null;
    if(data.iddemande){
        try {
            entetedemande = await enteteDemande.get_demande_by_id(data.iddemande);
        } catch (error) {
            throw new Error("Erreur de recuperation de entete demande.");
        }
    }

    if(!data.idnature){
        throw new Error("Nature operation non renseigné.");
    }

    const newLignedemande = new ligneDemandeModel(uuidv4(), data.iddemande || entetedemande.data.iddemande, data.numligne, data.libellelignedemande, data.montantdemande, data.idnature, 
    data.idbudget || null, data.idcentre, data.idtiers, data.idsociete, data.idsite, data.createdat, data.createdby);

    const recorded = await newLignedemande.create_ligneDemande(newLignedemande);
    if(!recorded.success){
        throw new Error(recorded.message);
    }

    return recorded.data
}

async function update_lignedemande(idlignedemande, data) {
    if(!idlignedemande || !data.idnature){
        throw new Error("Erreur de donnée.");
    }

    if(!data.iddemande || !data.montantdemande){
        throw new Error("Ligne sans entête, sans montant.");
    }

    try {
        const lignedemande_ = await ligneModel.update_ligneDemande(idlignedemande, data);
        return lignedemande_;
    } catch (err) {
        console.log(`Erreur de modification: ${err}`.cyan.bold);
        throw err;
    }
}

async function delete_lignedemande(idlignedemande){
    if (!idlignedemande) {
        throw new Error("ID Ligne requis");
    }

    try {
        const ligne_ = await ligneModel.delete_ligneDemande(idlignedemande);
        if (!ligne_.success) {
          throw new Error(ligne_.message);
        }
        return ligne_;
    } catch (err) {
        throw err;
    }
}


module.exports = {
    create_lignedemande,
    update_lignedemande,
    delete_lignedemande
}