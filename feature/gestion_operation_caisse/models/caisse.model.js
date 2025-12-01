const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const journalModel = require('./journal.model');
const { caisseQueries } = require('../queries/queryIndex');
//const devisemodel = require('');
const journalmodel = new journalModel();
//const comptemodel = require('');
//const societemodel = require('');
//const comptemodel = require('');

const queryInsert = `
        INSERT INTO Caisse (idcaisse,codecaisse, libelle, idjournal, iddevise, idsite, idsociete, idcompte, actif, createdat, createdby, updatedat, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idcaisse,@codecaisse, @libelle, @idjournal, @iddevise, @idsite, @idsociete, @idcompte, @actif, @createdat, @createdby, @updatedat, @updatedby)
        `;

const queryUpdate = `UPDATE Caisse SET codecaisse = @codecaisse, libelle = @libelle, idjournal = @idjournal,  iddevise = @iddevise, idsite = @idsite, idsociete = @idsociete, idcompte = @idcompte, actif = @actif, updatedat = @updatedat, updatedby = @updatedby OUTPUT INSERTED.* WHERE codecaisse = @codecaisse`;

class caisseModel {
  constructor(idcaisse,codecaisse,libelle, idjournal, iddevise, idsite, idsociete,idcompte,actif,createdat,createdby,updatedat,updatedby, journal = null, devise = null, site = null, societe = null, compte = null) 
  {
    this.idcaisse = idcaisse;
    this.codecaisse = codecaisse;
    this.libelle = libelle;

    this.idjournal = idjournal;
    this.iddevise = iddevise;   
    this.idsite = idsite;     
    this.idsociete = idsociete;   
    this.idcompte = idcompte;     

    this.actif = actif;
    this.createdat = createdat;
    this.createdby = createdby;
    this.updatedat = updatedat;
    this.updatedby = updatedby;

    this.journal = journal;   // peut être null
    this.devise = devise;     // peut être null
    this.site = site;         // peut être null
    this.societe = societe;   // peut être null
    this.compte = compte;     // peut être null
  }

    async create_caissemodel() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idcaisse', sql.UniqueIdentifier, this.idcaisse)
            .input('codecaisse', sql.NVarChar(24), this.codecaisse)
            .input('idjournal', sql.UniqueIdentifier, this.idjournal)
            .input('iddevise', sql.UniqueIdentifier, this.iddevise)
            .input('idsite', sql.UniqueIdentifier, this.idsite)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('idcompte', sql.UniqueIdentifier, this.idcompte)
            .input('libelle', sql.NVarChar(50), this.libelle)
            .input('actif', sql.Int, this.actif)
            .input('createdat', sql.DateTime, this.createdat)
            .input('createdby', sql.NVarChar(100), this.createdby)
            .input('updatedat', sql.DateTime, this.updatedat)
            .input('updatedby', sql.NVarChar(100), this.updatedby)
            .query(caisseQueries.insert);
            
            console.log(result);
            return { success: true, data: result.recordset[0] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_allcaisses (page = 1, limit = 5) {
        const pool = await connectDB();
        const offset = (page - 1) * limit;
        try {
            const result = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .query(caisseQueries.getAll);
            
            const caisses = result.recordsets[0];
            const total = result.recordsets[1][0].total;
            const totalPages = Math.ceil(total / limit);

            return {page, limit, total, totalPages, data: caisses};
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }

    async get_onecaisse(idcaisse){
        const pool = await connectDB();
        try {
            const result = await pool.request().input('idcaisse', sql.UniqueIdentifier, idcaisse).query("SELECT * FROM Caisse WHERE idcaisse = @idcaisse");
            const caisse = result.recordset[0];
            let journal = null;
            let site = null;
            let devise = null;
            let societe = null;
            let compte = null;
            if (caisse.idjournal) {
                journal = await journalmodel.get_onejournal(caisse.idjournal);
            }
            // if (caisse.iddevise) {
            //     devise = await devisemodel.get_onedevise(caisse.iddevise);
            // }
            // if (caisse.idsite) {
            //     site = await sitemodel.get_onesite(caisse.idsite);
            // }
            // if (caisse.idsociete) {
            //     devisereporting = await societemodel.get_onesociete(caisse.idsociete);
            // }
            // if (caisse.idcompte) {
            //     compte = await comptemodel.get_onecompte(caisse.idcompte);
            // }
            
            return {...caisse, societe : societe, site : site , journal : journal, compte : compte, devise : devise};
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update_caisse (codecaisse, data) {
        const pool = await connectDB();
        try {
            const check = await pool.request()
            .input('codecaisse', sql.NVarChar(50), codecaisse)
            .query(`SELECT COUNT(*) AS count FROM Caisse WHERE codecaisse = @codecaisse`);

            // S'il existe update
            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('codecaisse', sql.NVarChar(24), data.codecaisse)
                    .input('idjournal', sql.UniqueIdentifier, data.idjournal)
                    .input('iddevise', sql.UniqueIdentifier, data.iddevise)
                    .input('idsite', sql.UniqueIdentifier, data.idsite)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('idcompte', sql.UniqueIdentifier, data.idcompte)
                    .input('libelle', sql.NVarChar(50), data.libelle)
                    .input('actif', sql.Int, data.actif)
                    .input('updatedAt', sql.DateTime, new Date())
                    .input('updatedBy', sql.NVarChar(100), data.updatedby || 'System')
                    .query(caisseQueries.update);
                return result;
            } else {
                // 3️ Sinon → INSERT
                const result = await pool.request()
                    .input('idcaisse', sql.UniqueIdentifier, uuidv4())
                    .input('codecaisse', sql.NVarChar(24), data.codecaisse)
                    .input('idjournal', sql.UniqueIdentifier, data.idjournal)
                    .input('iddevise', sql.UniqueIdentifier, data.iddevise)
                    .input('idsite', sql.UniqueIdentifier, data.idsite)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('idcompte', sql.UniqueIdentifier, data.idcompte)
                    .input('libelle', sql.NVarChar(50), data.libelle)
                    .input('actif', sql.Int, data.actif)
                    .input('createdat', sql.DateTime, new Date())
                    .input('createdby', sql.NVarChar(100), data.createdby || 'System')
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(100), data.updatedby || 'System')
                    .query(caisseQueries.insert);
                return result;
            }
        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    async delete_caisse (idcaisse) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idcaisse', sql.UniqueIdentifier, idcaisse)
            .query("DELETE FROM Caisse WHERE idcaisse = @idcaisse");
            return { success: true, data: result };
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
        }
    }
}



module.exports = caisseModel;