const { v4: uuidv4 } = require('uuid');
const PaginationModel = require("../../../shared/utils/model");
const deviseservice = require("../../gestion_organisation/services/devise.service");
const societeservice = require("../../gestion_organisation/services/societe.service");
const siteservice = require("../../gestion_organisation/services/site.service");
const ligneDemandeModel = require("../models/lignedemande.model");
const enteteDemandeModel = require("../models/entetedemande.model");
const detailDemandeModel = require("../models/detaildemande.model");

let ligneModel = new ligneDemandeModel();
let detailModel = new detailDemandeModel();
let enteteDemande = new enteteDemandeModel();
let demandes = []; 

async function create_detaildemande(data){
    const today = new Date();
    if(!data.idlignedemande || !data.montant){
        throw new Error("Detail sans ligne, sans montant.");
    } 
    let demande = null;
    if(data.iddemande){
        try {
            demande = await enteteDemande.get_demande_by_id(data.iddemande);
        } catch (error) {
            throw new Error("Erreur de recuperation de entete demande.");
        }
    }

    let lignedemande = null;
    if(data.idlignedemande){
        try {
            lignedemande = await ligneModel.get_oneLigne(data.idlignedemande);
        } catch (error) {
            throw new Error("Erreur de recuperation de la  ligne demande.");
        }
    }

    const newdetailDemande = new detailDemandeModel(uuidv4(), data.iddemande || demande.iddemande, data.idlignedemande || data.idlignedemande, data.idsociete, data.description, data.quantite || 0, data.montant, today, data.createdby || 'system');
    const recorded = await newdetailDemande.create_detailsDemande(newdetailDemande);
    if(!recorded.success){
        throw new Error(recorded.message);
    }

    return recorded.data
}

async function update_detaildemande(iddetaildemande, data) {
    if(!iddetaildemande){
        throw new Error("Erreur de donnée.");
    }

    if(!data.idlignedemande || !data.montant){
        throw new Error("Detail sans ligne, sans montant.");
    }

    try {
        const detaildemande_ = await detailModel.update_detailsDemande(iddetaildemande, data);
        return detaildemande_.recordset;
    } catch (err) {
        console.log(`Erreur de modification: ${err}`.cyan.bold);
        throw err;
    }
}

async function delete_detaildemande(iddetaildemande){
    if (!iddetaildemande) {
        throw new Error("ID détail requis");
    }

    try {
        const detail_ = await detailModel.delete_detailsDemande(iddetaildemande);
        if (!detail_.success) {
          throw new Error(detail_.message);
        }
        return detail_;
    } catch (err) {
        throw err;
    }
}


module.exports = {
    create_detaildemande,
    update_detaildemande,
    delete_detaildemande
}