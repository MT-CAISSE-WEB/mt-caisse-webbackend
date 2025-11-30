const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const societeModel = require('../../gestion_organisation/models/societe.model');
const plancomptableModel = require('./plancomptable.model');
const societemodel = new societeModel()
const plancomptablemodel = new plancomptableModel();



const queryInsert = `
        INSERT INTO NatureOperation (idnature, codenature, libelle, avanceajustifier, 
        imputationtiers, actif, demandedecaissement, idsociete, idcompte,
        createdat, updatedat, createdby, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idnature, @codenature, @libelle, @avanceajustifier, @imputationtiers,
        @actif, @demandedecaissement, @idsociete, @idcompte,
        @createdat, @updatedat, @createdby, @updatedby)
        `;

const queryUpdate = `UPDATE NatureOperation SET libelle = @libelle,
 avanceajustifier = @avanceajustifier, imputationtiers = @imputationtiers,
  actif = @actif, demandedecaissement = @demandedecaissement, 
  idsociete = @idsociete, idcompte = @idcompte, 
  updatedat = @updatedat, updatedby = @updatedby OUTPUT INSERTED.* WHERE idnature = @idnature`;


// Model natureoperation
class NatureOperationModel {
    constructor(idnature, codenature, libelle, avanceajustifier, imputationtiers, 
        actif, demandedecaissement, idsociete, idcompte,
        createdat, updatedat, createdby, updatedby)
    {
        this.idnature = idnature;
        this.codenature = codenature;
        this.libelle = libelle;
        this.avanceajustifier = avanceajustifier;
        this.imputationtiers = imputationtiers;
        this.actif = actif;
        this.demandedecaissement = demandedecaissement;
        this.idsociete = idsociete;
        this.idcompte = idcompte;
        this.createdat = createdat;
        this.updatedat = updatedat;
        this.createdby = createdby;
        this.updatedby = updatedby;
    }


    // Créer un compte
    async create_nature() {
        const pool = await connectDB();
        try{
            const result = await pool.request()
            .input('idnature', sql.UniqueIdentifier, this.idnature)
            .input('codenature', sql.NVarChar(50), this.codenature)
            .input('libelle', sql.NVarChar(150), this.libelle)
            .input('avanceajustifier', sql.Int, this.avanceajustifier)
            .input('imputationtiers', sql.Int, this.imputationtiers)
            .input('actif', sql.Int, this.actif)
            .input('demandedecaissement', sql.Int, this.demandedecaissement)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('idcompte', sql.UniqueIdentifier, this.idcompte)
            .input('createdat', sql.DateTime, this.createdat)
            .input('updatedat', sql.DateTime, this.updatedat)
            .input('createdby', sql.NVarChar(50), this.createdby)
            .input('updatedby', sql.NVarChar(50), this.updatedby)
            .query(queryInsert);
            return { success: true, data: result.recordset[0] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }


    // Rechercher toutes les natures d'opération
    async get_allnatures () {
        const pool = await connectDB();
        const query = "SELECT * FROM NatureOperation"
        try {
            const result = await pool.request().query(query);
            return result;
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }


    // Rechercher un natureoperation
    async get_onenature (idnature) {
        const pool = await connectDB();
        try {
            const result = await pool.request().input("idnature", idnature).query("SELECT * FROM NatureOperation WHERE idnature = @idnature");
            const nature = result.recordset[0];
            let societe = null;
            let compte = null;
            if (nature.idsociete && nature.idcompte) {
                societe = await societemodel.get_onesociete(nature.idsociete);
                compte = await plancomptablemodel.get_onecompte(nature.idcompte);
            }
            return {...nature, societe : societe, compte : compte};
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Met à jour un compte
    async update_nature (idnature, data) {
        const pool = await connectDB();
        try {
            const check = await pool.request().input('codenature', data.codenature)
            .query(`SELECT COUNT(*) AS count FROM NatureOperation WHERE codenature = @codenature`);

            // S'il existe aumoins une ligne, update
            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('idnature', idnature)
                    .input('codenature', sql.NVarChar(50), data.codenature)
                    .input('libelle', sql.NVarChar(150), data.libelle)
                    .input('avanceajustifier', sql.Int, data.avanceajustifier)
                    .input('imputationtiers', sql.Int, data.imputationtiers)
                    .input('actif', sql.Int, data.actif)
                    .input('demandedecaissement', sql.Int, data.demandedecaissement)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('idcompte', sql.UniqueIdentifier, data.idcompte)
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(50), data.updatedby)
                    .query(queryUpdate);
                return result;
            } else {
                // Sinon insert
                const result = await pool.request()
                    .input('idnature', sql.UniqueIdentifier, uuidv4())
                    .input('codenature', sql.NVarChar(50), data.codenature)
                    .input('libelle', sql.NVarChar(150), data.libelle)
                    .input('avanceajustifier', sql.Int, data.avanceajustifier)
                    .input('imputationtiers', sql.Int, data.imputationtiers)
                    .input('actif', sql.Int, data.actif)
                    .input('demandedecaissement', sql.Int, data.demandedecaissement)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('idcompte', sql.UniqueIdentifier, data.idcompte)
                    .input('createdat', sql.DateTime, new Date())
                    .input('updatedat', sql.DateTime, null)
                    .input('createdby', sql.NVarChar(50), data.createdby)
                    .input('updatedby', sql.NVarChar(50), null)
                    .query(queryInsert);
                return result;
            }
        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }


    // Supprimer une nature d'opération
    async delete_nature(idnature) {
        const pool = await connectDB();

        // 1. Vérifier si le compte existe
        const check = await pool.request()
            .input("idnature", sql.UniqueIdentifier, idnature)
            .query("SELECT idnature FROM NatureOperation WHERE idnature = @idnature");

        if (check.recordset.length === 0) {
            return {
                message: "Nature inexistante."
            };
        }

        // 2. Supprimer le compte
        try {
            await pool.request()
                .input("idnature", sql.UniqueIdentifier, idnature)
                .query("DELETE FROM NatureOperation WHERE idnature = @idnature");
            return { success: true, message: "Nature supprimée avec succès." };
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
            return {success: false, message: "Erreur de suppression : " + error.message };
        }
    }
}

module.exports = NatureOperationModel;