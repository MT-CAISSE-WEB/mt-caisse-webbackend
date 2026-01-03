const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const utilisateurservice = require('../../gestion_users/services/users.service');
const caisseModel = require('./caisse.model');
const caissemodel = new caisseModel();
const societeservice = require('../../gestion_organisation/services/societe.service');
const { utilisateurcaisseQueries } = require('../queries/queryIndex');

class UtilisateurCaisseModel {
    constructor(idutilisateurcaisse,idcaisse,codecaisse,idutilisateur,idsociete,actif,createdat,createdby,updatedat,updatedby, caisse = null, utilisateur = null, societe = null)
    {
        this.idutilisateurcaisse = idutilisateurcaisse;
        this.idcaisse = idcaisse;
        this.codecaisse = codecaisse;
        this.idutilisateur = idutilisateur;
        this.idsociete = idsociete;
        this.actif = actif;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;

        this.caisse = caisse ;
        this.utilisateur = utilisateur;
        this.societe = societe;
    }

    async create_utilisateurcaissemodel() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idutilisateurcaisse', sql.UniqueIdentifier, this.idutilisateurcaisse)
            .input('idcaisse', sql.UniqueIdentifier, this.idcaisse)
            .input('idutilisateur', sql.UniqueIdentifier, this.idutilisateur)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('actif', sql.Int, this.actif)
            .input('createdat', sql.DateTime, this.createdat)
            .input('createdby', sql.NVarChar(100), this.createdby)
            .query(utilisateurcaisseQueries.insert);
            
            return { success: true, data: result.recordset[0] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_allutilisateurcaisses ({ page = 1, limit = 5, search = null, actif = null}) {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 5;
        
        const pool = await connectDB();
        const offset = (page - 1) * limit;

        try {
            const result = await pool.request()
                .input('offset', sql.Int, offset)
                .input('limit', sql.Int, limit)
                .input('search', sql.NVarChar, search ? `%${search}%` : null)
                .input('actif', sql.Int, actif || null)
                .query(utilisateurcaisseQueries.getAll);

            const utilisateurcaisses = result.recordsets[0];
            const total = result.recordsets[1][0].total;
            const totalPages = Math.ceil(total / limit);
            
            return {page, limit, total, totalPages, data: utilisateurcaisses};
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }

    async get_oneutilisateurcaisse(idutilsateurcaisse){
        const pool = await connectDB();
        try {
            const result = await pool.request().input("idutilsateurcaisse", idutilsateurcaisse).query(utilisateurcaisseQueries.getbyId);
            const utilsateurcaisse = result.recordset[0];
            let societe = null;
            let utilisateur = null;
            let caisse = null;

            if(utilsateurcaisse.idsociete){
                societe = await societeservice.getonesociete(utilsateurcaisse.idsociete);
            }
            if(utilsateurcaisse.idutilisateur){
                utilisateur = await utilisateurservice.getoneuser(utilsateurcaisse.idutilisateur);
            }
            if(utilsateurcaisse.idcaisse){
                caisse = await caissemodel.get_onecaisse(utilsateurcaisse.idcaisse);
            }
            
            return {...utilsateurcaisse, societe : societe.data || null, utilisateur : utilisateur.data || null, caisse : caisse};
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_caisseByUser(idutilisateur){
        const pool = await connectDB();
        try {
            const result = await pool.request().input("idutilisateur", idutilisateur).query(utilisateurcaisseQueries.getcaisseByUser);
            const utilsateurcaisse = result.recordset;
            return utilsateurcaisse;
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update_utilisateurcaisse (idutilisateurcaisse, data) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idutilisateurcaisse', sql.UniqueIdentifier, idutilisateurcaisse)
                .input('idcaisse', sql.UniqueIdentifier, data.idcaisse)
                .input('idutilisateur', sql.UniqueIdentifier, data.idutilisateur)
                .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                .input('actif', sql.Int, data.actif)
                .input('updatedat', sql.DateTime, new Date())
                .input('updatedby', sql.NVarChar(100), data.updatedby)
                .query(utilisateurcaisseQueries.update);
            return result;
        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    async delete_utilisateurcaisse (idutilisateurcaisse) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idutilisateurcaisse', sql.UniqueIdentifier, idutilisateurcaisse)
            .query(utilisateurcaisseQueries.delete);
             return { success: true, data: result };
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
        }
    }

    async get_caisseuser(idcaisse, idutilisateur){
        const pool = await sql.connect();

        try {
            const check = await pool.request()
                .input("idcaisse", sql.UniqueIdentifier, idcaisse)
                .input("idutilisateur", sql.UniqueIdentifier, idutilisateur)
                .query(utilisateurcaisseQueries.getcaisseUser);
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = UtilisateurCaisseModel;