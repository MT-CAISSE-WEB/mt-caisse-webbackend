const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const caissemodel = require('./caisse.model');
//const societemodel = require('');
//const sitemodel = require('');
const operationmodel = require('./operation.model');
const { operationQueries } = require('../queries/queryIndex');

const queryInsert = `
        INSERT INTO TypeOperation (idtypeoperation, codetypeoperation, idoperation, codeoperation, idsociete, codesociete, idsite, codesite, idcaisse, codecaisse, montant, createdat, createdby, updatedat, updatedby)
        OUTPUT INSERTED.*
        VALUES (idtypeoperation = @idtypeoperation, codetypeoperation = @codetypeoperation, idoperation = @idoperation, codeoperation = @codeoperation, idsociete = @idsociete, codesociete = @codesociete, idsite = @idsite, codesite = @codesite, idcaisse = @idcaisse, codecaisse = @codecaisse, montant = @montant, updatedat = @updatedat, updatedby = @updatedby)
        `;

const queryUpdate = `UPDATE TypeOperation SET codetypeoperation = @codetypeoperation, idoperation = @idoperation, codeoperation = @codeoperation, idsociete = @idsociete, codesociete = @codesociete, idsite = @idsite, codesite = @codesite, idcaisse = @idcaisse, codecaisse = @codecaisse, montant = @montant, updatedat = @updatedat, updatedby = @updatedby OUTPUT INSERTED.* WHERE codetypeoperation = @codetypeoperation`;

class typeoperationModel {
    constructor(idtypeoperation, codetypeoperation, idoperation, codeoperation, idsociete, codesociete, idsite, codesite, idcaisse, codecaisse, montant, createdat, createdby, updatedat, updatedby)
    {
        this.idtypeoperation = idtypeoperation;
        this.codetypeoperation = codetypeoperation;
        this.idoperation = idoperation;
        this.codeoperation = codeoperation;
        this.idsociete = idsociete;
        this.codesociete = codesociete;
        this.idsite = idsite;
        this.codesite = codesite;
        this.idcaisse = idcaisse;
        this.codecaisse = codecaisse;
        this.montant = montant;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;
    }

    async create_typeoperationmodel() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idtypeoperation', sql.UniqueIdentifier, this.idtypeoperation)
            .input('codetypeoperation', sql.NVarChar(24), this.codetypeoperation)
            .input('idoperation', sql.UniqueIdentifier, this.idoperation)
            .input('codeoperation', sql.NVarChar(24), this.codeoperation)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('codesociete', sql.NVarChar(24), this.codesociete)
            .input('idsite', sql.UniqueIdentifier, this.idsite)
            .input('codesite', sql.NVarChar(24), this.codesite)
            .input('idcaisse', sql.UniqueIdentifier, this.idcaisse)
            .input('codecaisse', sql.NVarChar(24), this.codecaisse)
            .input('montant', sql.Decimal(21,9), this.montant)
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

    async get_alltypeoperations (page = 1, limit = 5) {
        const pool = await connectDB();
        const offset = (page - 1) * limit;
        //const query = "SELECT * FROM TypeOperation"
        try {
            const result = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .query(operationQueries.getAll);

            const operations = result.recordsets[0];
            const total = result.recordsets[1][0].total;
            const totalPages = Math.ceil(total / limit);
            
            return {page, limit, total, totalPages, data: operations};
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }

    async get_onetypeoperation(idtypeoperation){
        const pool = await connectDB();
        try {
            const result = await pool.request().input("idtypeoperation", idtypeoperation).query("SELECT * FROM TypeOperation WHERE idtypeoperation = @idtypeoperation");
            const typeoperation = result.recordset[0];
            let caisse = null;
            let societe = null;
            let site = null;
            let operation = null;

            if(typeoperation.idoperation){
                operation = await operationmodel.get_onetypeoperation(typeoperation.idoperation);
            }
            // if(typeoperation.idsociete){
            //     societe = await societemodel.get_onesociete(typeoperation.idsociete);
            // }
            if(typeoperation.idcaisse){
                caisse = await caissemodel.get_onecaisse(typeoperation.idcaisse);
            }
            // if(typeoperation.idsite){
            //     site = await sitemodel.get_onesite(typeoperation.idsite);
            // }
            return {...typeoperation, societe : societe, site : site, caisse : caisse, operation : operation};
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update_typeoperation (idtypeoperation, data) {
        const pool = await connectDB();
        try {
            const check = await pool.request()
            .input('idtypeoperation', sql.NVarChar(50), idtypeoperation)
            .query(`SELECT COUNT(*) AS count FROM TypeOperation WHERE idtypeoperation = @idtypeoperation`);

            // S'il existe update
            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('idtypeoperation', sql.UniqueIdentifier, data.idtypeoperation)
                    .input('codetypeoperation', sql.NVarChar(24), data.codetypeoperation)
                    .input('idoperation', sql.UniqueIdentifier, data.idoperation)
                    .input('codeoperation', sql.NVarChar(24), data.codeoperation)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('codesociete', sql.NVarChar(24), data.codesociete)
                    .input('idsite', sql.UniqueIdentifier, data.idsite)
                    .input('codesite', sql.NVarChar(24), data.codesite)
                    .input('idcaisse', sql.UniqueIdentifier, data.idcaisse)
                    .input('codecaisse', sql.NVarChar(24), data.codecaisse)
                    .input('montant', sql.Decimal(21,9), data.montant)
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(100), data.updatedby)
                    .query(queryUpdate);
                return result;
            } else {
                // 3️ Sinon → INSERT
                const result = await pool.request()
                    .input('idtypeoperation', sql.UniqueIdentifier,  uuidv4())
                    .input('codetypeoperation', sql.NVarChar(24), data.codetypeoperation)
                    .input('idoperation', sql.UniqueIdentifier, data.idoperation)
                    .input('codeoperation', sql.NVarChar(24), data.codeoperation)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('codesociete', sql.NVarChar(24), data.codesociete)
                    .input('idsite', sql.UniqueIdentifier, data.idsite)
                    .input('codesite', sql.NVarChar(24), data.codesite)
                    .input('idcaisse', sql.UniqueIdentifier, data.idcaisse)
                    .input('codecaisse', sql.NVarChar(24), data.codecaisse)
                    .input('montant', sql.Decimal(21,9), data.montant)
                    .input('createdat', sql.DateTime, new Date())
                    .input('createdby', sql.NVarChar(100), data.createdby)
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(100), data.updatedby)
                    .query(queryInsert);
                return result;
            }
        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    async delete_typeoperation (idtypeoperation) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idtypeoperation', sql.UniqueIdentifier, idtypeoperation)
            .query("DELETE FROM TypeOperation WHERE idtypeoperation = @idtypeoperation");
            return result;
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
        }
    }
}



module.exports = typeoperationModel;