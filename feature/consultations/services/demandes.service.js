const { connectDB } = require('../../../config/db');
const sql = require('mssql');
const { DemandeQueries } = require('../queries/queryIndex');
const PaginationModel = require('../../../shared/utils/model');


async function demandeConsultation(data){
    const pool = await connectDB();

    const page = parseInt(data.page) || 1;
    const limit = parseInt(data.limit) || 10;
    const offset = (page - 1) * limit;
    
    try {
        const result = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .input('idsite', sql.UniqueIdentifier, data.idsite)
            .input('typeentitesociete', sql.Int, data.typeentitesociete)
            .input('datedebut', sql.Date, data.datedebut || null)
            .input('datefin', sql.Date, data.datefin || null)
            .input('codedemande', sql.UniqueIdentifier, data.codedemande || null)
            .query(DemandeQueries.requestConsultation);
        
        const dataRows = result.recordsets[0];            // données paginées
        const totalRows = result.recordsets[1][0].total;  // total

        return new PaginationModel(page, limit, totalRows, dataRows);
    } catch (error) {
        throw error;
    }
}

async function demandeConsultationByuser(data){
    const pool = await connectDB();

    const page = parseInt(data.page) || 1;
    const limit = parseInt(data.limit) || 10;
    const offset = (page - 1) * limit;
    
    try {
        const result = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .input('idutilisateur', sql.UniqueIdentifier, data.idutilisateur)
            .query(DemandeQueries.demandeByuser);
        
        const dataRows = result.recordsets[0];            // données paginées
        const totalRows = result.recordsets[1][0].total;  // total

        const demandes = {};
        dataRows.forEach(row => {
            const iddemande = row.iddemande;
            //Si la demande n'existe pas encore dans le dictionnaire, on la crée
            if (!demandes[iddemande]) {
                demandes[iddemande] = {
                    iddemande: row.iddemande,
                    codedemande : row.codedemande,
                    libelledemande : row.libelledemande,
                    datedemande : row.datedemande,
                    decaisse : row.decaisse,
                    solde : row.solde,
                    statut : row.statut,
                    niveauactuel: row.niveauactuel,
                    demandeur: {
                        codeuser: row.codeutilisateur,
                        nom : row.nom,
                        prenom : row.prenom
                    },
                    devise : {
                        codedevise: row.codedevise,
                        intitule : row.devise
                    },
                    site : {
                        idsite: row.idsite,
                        codesite: row.codesite,
                        libelle : row.site
                    },
                    lignes : [],
                    _lignesMap: {} // interne
                }
            }

            const demande = demandes[row.iddemande];

            /* =========================
            LIGNE DEMANDE
            ========================= */

            if (row.idlignedemande) {
                if (!demande._lignesMap[row.idlignedemande]) {
                demande._lignesMap[row.idlignedemande] = {
                    montantdemande: row.montantdemande,
                    natureoperation: {
                        codenature: row.codenature,
                        libelle: row.nature_operation
                    },
                    centreanalytique: {
                        code: row.codecentreanalytique,
                        libelle: row.centre_analytique
                    },
                    tiers: {
                        code: row.codetiers,
                        libelle: row.tiers
                    }
                };

                demande.lignes.push(demande._lignesMap[row.idlignedemande]);
            }

            const ligne = demande._lignesMap[row.idlignedemande]; }});
        
        const demandesArray =  Object.values(demandes).map(d => {delete d._lignesMap; return d;});

        return new PaginationModel(page, limit, totalRows, demandesArray);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = {
    demandeConsultation,
    demandeConsultationByuser
};