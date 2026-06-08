const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const societemodel = require('../../gestion_organisation/models/societe.model');
const enteteoperationmodel = require('./enteteoperation.model');
//const sitemodel = require('');
//const centreanalytiquemodel = require('');
//const devisemodel = require('');
//const naturemodel = require('');
//const tiersmodel = require('');

const queryInsert = `
        INSERT INTO LigneOperationCaisse (idligneoperation, idoperation, idnature, idcentre, idsociete, idtiers, libelle, montantoperation, comptabilise, numpiececomptable, datecomptabilisation, createdat, createdby, updatedat, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idligneoperation, @idoperation, @idnature, @idcentre, @idsociete, @idtiers, @libelle, @montantoperation, @comptabilise, @numpiececomptable, @datecomptabilisation, @createdat, @createdby, @updatedat, @updatedby)
        `;

const queryUpdate = `UPDATE LigneOperationCaisse SET idnature = @idnature, idcentre = @idcentre, libelle = @libelle, montantoperation = @montantoperation, idtiers = @idtiers, updatedat = @updatedat, updatedby = @updatedby OUTPUT INSERTED.* WHERE idligneoperation = @idligneoperation`;

class ligneoperationModel {
    constructor(idligneoperation, idoperation, codeoperation, idsociete, codesociete, idtiers, codetiers, idnature, codenature, idcentre, codecentre, libelle, montantoperation, comptabilise, numpiececomptable, datecomptabilisation, createdat, createdby, updatedat, updatedby)
    {
        this.idligneoperation = idligneoperation;
        this.idoperation = idoperation;
        this.codeoperation = codeoperation;
        this.idsociete = idsociete;
        this.codesociete = codesociete;
        this.idtiers = idtiers;
        this.codetiers = codetiers;
        this.idnature = idnature;
        this.codenature = codenature;
        this.idcentre = idcentre;
        this.codecentre = codecentre;
        this.libelle = libelle;
        this.montantoperation = montantoperation;
        this.comptabilise = comptabilise;
        this.numpiececomptable = numpiececomptable;
        this.datecomptabilisation = datecomptabilisation;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;
    }

    async create_ligneoperationmodel() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idligneoperation', sql.UniqueIdentifier, this.idligneoperation)
            .input('idoperation', sql.UniqueIdentifier, this.idoperation)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('idsite', sql.UniqueIdentifier, this.idsite)
            .input('idtiers', sql.UniqueIdentifier, this.idtiers)
            .input('idnature', sql.UniqueIdentifier, this.idnature)
            .input('idcentre', sql.UniqueIdentifier, this.idcentre)
            .input('libelle', sql.NVarChar(255), this.libelle)
            .input('montantoperation', sql.Decimal(22,9), this.montantoperation)
            .input('numpiececomptable', sql.NVarChar(20), this.numpiececomptable)
            .input('comptabilise', sql.Int, this.comptabilise)
            .input('datecomptabilisation', sql.DateTime, this.datecomptabilisation)
            .input('createdat', sql.DateTime, this.createdat)
            .input('createdby', sql.NVarChar(100), this.createdby)
            .input('updatedat', sql.DateTime, this.updatedat)
            .input('updatedby', sql.NVarChar(100), this.updatedby)
            .query(queryInsert);
            
            return { success: true, data: result.recordset[0] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_allligneoperations () {
        const pool = await connectDB();
        const query = "SELECT * FROM LigneOperationCaisse"
        try {
            const result = await pool.request().query(query);
            return result;
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }

    async get_oneligneoperation(idligneoperation){
        const pool = await connectDB();
        try {
            const result = await pool.request().input('idligneoperation', sql.UniqueIdentifier, idligneoperation).query("SELECT * FROM LigneOperationCaisse WHERE idligneoperation = @idligneoperation");
            const ligneoperation = result.recordset[0];
            let operation = null ;
            let societe = null;
            let nature = null;
            let centreanalytique = null;
            let site = null;
            let devise = null;
            let tiers = null;
            if (ligneoperation.idoperation) {
                operation = await operationmodel.get_oneoperation(ligneoperation.idoperation);
            }
            // if (ligneoperation.idnature) {
            //     nature = await naturemodel.get_onenatureoperation(ligneoperation.idnature);
            // }
            // if (ligneoperation.idcentre) {
            //     centre = await centreanalytiquemodel.get_onecentreanalytique(ligneoperation.idcentre);
            // }
            // if (ligneoperation.iddevise) {
            //     devise = await devisemodel.get_onedevise(ligneoperation.iddevise);
            // }
            // if (ligneoperation.idsociete) {
            //     societe = await societemodel.get_onesociete(ligneoperation.idsociete);
            // }
            // if (ligneoperation.idsite) {
            //     site = await sitemodel.get_onesite(ligneoperation.idsite);
            // }
            // if (ligneoperation.idtiers) {
            //     tiers = await tiersmodel.get_onetiers(ligneoperation.idtiers);
            // }
            
            return {...ligneoperation, operation: operation, devise : devise, societe : societe, site : site, tiers : tiers, nature : nature, centre_analytique : centreanalytique };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update_ligneoperation (idligneoperation, data) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idligneoperation', sql.UniqueIdentifier, idligneoperation)
                .input('idoperation', sql.UniqueIdentifier, data.idoperation)
                .input('idtiers', sql.UniqueIdentifier, data.idtiers)
                .input('idnature', sql.UniqueIdentifier, data.idnature)
                .input('idcentre', sql.UniqueIdentifier, data.idcentre)
                .input('libelle', sql.NVarChar(255), data.libelle)
                .input('montantoperation', sql.Decimal(22,9), data.montantoperation)
                .input('numpiececomptable', sql.NVarChar(20), data.numpiececomptable)
                .input('comptabilise', sql.Int, data.comptabilise)
                .input('datecomptabilisation', sql.DateTime, data.datecomptabilisation)
                .input('updatedat', sql.DateTime, new Date())
                .input('updatedby', sql.NVarChar(100), data.updatedby || 'System')
                .query(queryUpdate);
            return result;
        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    async delete_ligneoperation (idligneoperation) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idligneoperation', sql.UniqueIdentifier, idligneoperation)
            .query("DELETE FROM LigneOperationCaisse WHERE idligneoperation = @idligneoperation");
            return result;
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
        }
    }
}


module.exports = ligneoperationModel;
