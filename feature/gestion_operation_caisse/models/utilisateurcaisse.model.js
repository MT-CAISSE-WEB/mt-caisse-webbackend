const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
//const utilisateurmodel = require('');
const caissemodel = require('./caisse.model');
const societemodel = require('../../gestion_organisation/models/societe.model');
const societeModel = require('../../gestion_organisation/models/societe.model');

const queryInsert = `
        INSERT INTO UtilisateurCaisse (idutilsateurcaisse ,idcaisse, codecaisse, idutilisateur, codeutilisateur, idsociete, codesociete, actif, createdat, createdby, updatedat, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idutilsateurcaisse, @idcaisse,@codecaisse, @idutilisateur, @codeutilisateur, @idsociete, @codesociete, @actif, @createdat, @createdby, @updatedat, @updatedby)
        `;

const queryUpdate = `UPDATE UtilisateurCaisse SET codejournal = @codejournal, designation = @designation, actif = @actif, updatedat = @updatedat, updatedby = @updatedby OUTPUT INSERTED.* WHERE idutilsateurcaisse = @idutilsateurcaisse`;

class UtilisateurCaisseModel {
    constructor(idutilsateurcaisse,idcaisse,codecaisse,idutilisateur,codeutilisateur,idsociete,codesociete,actif,createdat,createdby,updatedat,updatedby)
    {
        this.idutilsateurcaisse = idutilsateurcaisse;
        this.idcaisse = idcaisse;
        this.codecaisse = codecaisse;
        this.idutilisateur = idutilisateur;
        this.codeutilisateur = codeutilisateur;
        this.idsociete = idsociete;
        this.codesociete = codesociete;
        this.actif = actif;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;
    }

    async create_utilisateurcaissemodel() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idutilsateurcaisse', sql.UniqueIdentifier, this.idutilsateurcaisse)
            .input('idcaisse', sql.UniqueIdentifier, this.idcaisse)
            .input('idutilisateur', sql.UniqueIdentifier, this.idutilisateur)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('codecaisse', sql.NVarChar(50), this.codecaisse)
            .input('codeutilisateur', sql.NVarChar(50), this.codeutilisateur)
            .input('codesociete', sql.NVarChar(50), this.codesociete)
            .input('actif', sql.Int, this.actif)
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

    async get_allutilisateurcaisses () {
        const pool = await connectDB();
        const query = "SELECT * FROM UtilisateurCaisse"
        try {
            const result = await pool.request().query(query);
            return result;
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }

    async get_oneutilisateurcaisse(idutilsateurcaisse){
        const pool = await connectDB();
        try {
            const result = await pool.request().input("idutilsateurcaisse", idutilsateurcaisse).query("SELECT * FROM Journal WHERE idutilsateurcaisse = @idutilsateurcaisse");
            const utilsateurcaisse = result.recordset[0];
            let societe = null;
            let utilisateur = null;
            let caisse = null;

            if(utilsateurcaisse.idsociete){
                societe = societeModel.get_onesociete(utilsateurcaisse.idsociete);
            }
            // if(utilsateurcaisse.idutilisateur){
            //     utilisateur = await utilisateurmodel.get_oneutilisateur(utilsateurcaisse.idutilisateur);
            // }
            if(utilsateurcaisse.idcaisse){
                caisse = await caissemodel.get_onecaisse(utilsateurcaisse.idcaisse);
            }
            
            return {...utilsateurcaisse, societe : societe, utilisateur : utilisateur, caisse : caisse};
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update_utilisateurcaisse (idutilsateurcaisse, data) {
        const pool = await connectDB();
        try {
            const check = await pool.request()
            .input('idutilsateurcaisse', sql.UniqueIdentifier, idutilsateurcaisse)
            .query(`SELECT COUNT(*) AS count FROM UtilisateurCaisse WHERE idutilsateurcaisse = @idutilsateurcaisse`);

            // S'il existe update
            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('idcaisse', sql.UniqueIdentifier, data.idcaisse)
                    .input('idutilisateur', sql.UniqueIdentifier, data.idutilisateur)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('codecaisse', sql.NVarChar(50), data.codecaisse)
                    .input('codeutilisateur', sql.NVarChar(50), data.codeutilisateur)
                    .input('codesociete', sql.NVarChar(50), data.codesociete)
                    .input('actif', sql.Int, data.actif)
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(100), data.updatedby)
                    .query(queryUpdate);
                return result;
            } else {
                // 3️ Sinon → INSERT
                const result = await pool.request()
                    .input('idutilsateurcaisse', sql.UniqueIdentifier, uuidv4())
                    .input('idcaisse', sql.UniqueIdentifier, data.idcaisse)
                    .input('idutilisateur', sql.UniqueIdentifier, data.idutilisateur)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('codecaisse', sql.NVarChar(50), data.codecaisse)
                    .input('codeutilisateur', sql.NVarChar(50), data.codeutilisateur)
                    .input('codesociete', sql.NVarChar(50), data.codesociete)
                    .input('actif', sql.Int, data.actif)
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

    async delete_utilisateurcaisse (idutilsateurcaisse) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idutilsateurcaisse', sql.UniqueIdentifier, idutilsateurcaisse)
            .query("DELETE FROM UtilisateurCaisse WHERE idutilsateurcaisse = @idutilsateurcaisse");
            return result;
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
        }
    }
}



module.exports = UtilisateurCaisseModel;