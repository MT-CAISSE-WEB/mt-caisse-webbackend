const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const societemodel = require('../../gestion_organisation/models/societe.model');
//const demandemodel = require('');

const queryInsert = `
        INSERT INTO EnteteOperationCaisse (idoperation, codeoperation, iddemande, idsociete, idsite, iddevise, dateoperation, montant, tauxoperation, createdat, createdby, updatedat, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idoperation,@codeoperation, @iddemande, @idsociete, @idsite, @iddevise, @dateoperation, @montant, @tauxoperation, @createdat, @createdby, @updatedat, @updatedby)
        `;
const queryUpdate = `UPDATE EnteteOperationCaisse SET iddemande = @iddemande, idsociete = @idsociete, idsite = @idsite, updatedat = @updatedat, updatedby = @updatedby OUTPUT INSERTED.* WHERE codeoperation = @codeoperation`;
const querySequence = `SELECT NEXT VALUE FOR SeqNumeroOperation AS seq;`;
class enteteOperationModel {
    constructor(idoperation, codeoperation, iddemande, idsociete, idsite, iddevise, codedevise, dateoperation, montant, tauxoperation, createdat,createdby,updatedat,updatedby)
    {
        this.idoperation = idoperation;
        this.codeoperation = codeoperation;
        this.iddemande = iddemande;
        this.idsociete = idsociete;
        this.idsite = idsite;
        this.iddevise = iddevise;
        this.codedevise = codedevise;
        this.dateoperation = dateoperation;
        this.montant = montant;
        this.tauxoperation = tauxoperation;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;
    }

    async create_enteteoperationmodel() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idoperation', sql.UniqueIdentifier, this.idoperation)
            .input('codeoperation', sql.NVarChar(24), this.codeoperation)
            .input('iddemande', sql.UniqueIdentifier, this.iddemande)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('idsite', sql.UniqueIdentifier, this.idsite)
            .input('iddevise', sql.UniqueIdentifier, this.iddevise)
            .input('dateoperation', sql.DateTime, this.dateoperation)
            .input('montant', sql.Decimal(21,9), this.montant)
            .input('tauxoperation', sql.Decimal(22,9), this.tauxoperation)
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

    async create_numoperation(prefixe, dte){
        const date = new Date(dte);
        const annee = String(date.getFullYear());
        const mois = String(date.getMonth() + 1).padStart(2, '0'); // +1 car les mois commencent à 0
        const jour = String(date.getDate()).padStart(2, '0');
        const pool = await connectDB();
        const result = await pool.request()
            .input('prefixe', sql.NVarChar, prefixe)
            .input('annee', sql.NVarChar, annee)
            .input('mois', sql.NVarChar, mois)
            .input('jour', sql.NVarChar, jour)
            .output('numero', sql.NVarChar(50))
            .execute('GenererNumeroOperation');

        const numero = result.output.numero;
        return numero;
    }

    async create_numecriture(prefixe, dte){
        const date = new Date(dte);
        const annee = String(date.getFullYear());
        const mois = String(date.getMonth() + 1).padStart(2, '0'); // +1 car les mois commencent à 0
        const pool = await connectDB();
        const result = await pool.request()
            .input('prefixe', sql.NVarChar, prefixe)
            .input('annee', sql.NVarChar, annee)
            .input('mois', sql.NVarChar, mois)
            .output('numero', sql.NVarChar(50))
            .execute('GenererNumeroEcriture');

        const numero = result.output.numero;
        return numero;
    }

    async get_allenteteoperations () {
        const pool = await connectDB();
        const query = "SELECT * FROM EnteteOperationCaisse"
        try {
            const result = await pool.request().query(query);
            return result;
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }

    async get_oneenteteoperation(idoperation){
        const pool = await connectDB();
        try {
            const result = await pool.request().input('idoperation', sql.UniqueIdentifier, idoperation).query("SELECT * FROM EnteteOperationCaisse WHERE idoperation = @idoperation");
            const enteteoperation = result.recordset[0];
            let demande = null ;
            let societe = null;
            // if (enteteoperation.iddemande) {
            //     demande = await demandemodel.get_onedemande(enteteoperation.iddemande);
            // }
            // if (enteteoperation.idsociete) {
            //     societe = await devisemodel.get_onedevise(enteteoperation.idsociete);
            // }
            
            return {...enteteoperation, societe : societe, demande : demande };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update_enteteoperation (codeoperation, data) {
        const pool = await connectDB();
        try {
            const check = await pool.request()
            .input('codeoperation', sql.NVarChar(50), codeoperation)
            .query(`SELECT COUNT(*) AS count FROM EnteteOperationCaisse WHERE codeoperation = @codeoperation`);

            // S'il existe update
            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('codeoperation', sql.NVarChar(24), data.codeoperation)
                    .input('iddemande', sql.UniqueIdentifier, data.iddemande)
                    .input('codedemande', sql.NVarChar(24), data.codedemande)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(100), data.updatedby || 'System')
                    .query(queryUpdate);
                return result;
            } else {
                // 3️ Sinon → INSERT
                //Générer le numero d'operation
                const prefix = "num";
                const numerogenere = await this.create_numoperation(prefix, data.dateoperation);

                const result = await pool.request()
                    .input('idoperation', sql.UniqueIdentifier, uuidv4())
                    .input('codeoperation', sql.NVarChar(24), numerogenere)
                    .input('iddemande', sql.UniqueIdentifier, data.iddemande)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('iddevise', sql.UniqueIdentifier, data.iddevise)
                    .input('codedevise', sql.NVarChar(25), data.codedevise)
                    .input('dateoperation', sql.DateTime, data.dateoperation)
                    .input('createdat', sql.DateTime, new Date())
                    .input('createdby', sql.NVarChar(100), data.createdBy || 'System')
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(100), data.updatedBy || 'System')
                    .query(queryInsert);
                return result;
            }
        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    async delete_enteteoperation (idoperation) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idoperation', sql.UniqueIdentifier, idoperation)
            .query("DELETE FROM EnteteOperationCaisse WHERE idoperation = @idoperation");
            return { success : true , data : result};
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
        }
    }
}


module.exports = enteteOperationModel;