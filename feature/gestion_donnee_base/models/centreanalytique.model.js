const { DateTime } = require('mssql');
const {sql, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const societeModel = require('../../gestion_organisation/models/societe.model');
const societemodel = new societeModel()


const queryInsert = `
        INSERT INTO CentreAnalytique (idcentreanalytique, codecentreanalytique, libelle, actif, idsociete,
        createdat, updatedat, createdby, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idcentreanalytique, @codecentreanalytique, @libelle, @actif, @idsociete,
        @createdat, @updatedat, @createdby, @updatedby)
        `;

const queryUpdate = `UPDATE CentreAnalytique SET libelle = @libelle, actif = @actif,
        idsociete = @idsociete, updatedat = @updatedat, updatedby = @updatedby 
        OUTPUT INSERTED.* WHERE idcentreanalytique = @idcentreanalytique`;


const query = `
        SELECT *
        FROM CentreAnalytique
        ORDER BY codecentreanalytique
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY;

        SELECT COUNT(*) AS total FROM CentreAnalytique;
    `;

// Model centreanalytique
class CentreAnalytiqueModel {
    constructor(idcentreanalytique, codecentreanalytique, libelle, actif, 
        idsociete, createdat, updatedat, createdby, updatedby)
    {
        this.idcentreanalytique = idcentreanalytique;
        this.codecentreanalytique = codecentreanalytique;
        this.libelle = libelle;
        this.actif = actif;
        this.idsociete = idsociete;
        this.createdat = createdat;
        this.updatedat = updatedat;
        this.createdby = createdby;
        this.updatedby = updatedby;
    }


    // Créer un centre
    async create_centre() {
        const pool = await connectDB();
        try{
            const result = await pool.request()
            .input('idcentreanalytique', sql.UniqueIdentifier, this.idcentreanalytique)
            .input('codecentreanalytique', sql.NVarChar(50), this.codecentreanalytique)
            .input('libelle', sql.NVarChar(150), this.libelle)
            .input('actif', sql.Int, this.actif)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
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


    // Rechercher tous les centres OK
    async get_allcentres (page = 1, limit = 50) {
        const pool = await connectDB();
        const offset = (page - 1) * limit;
            
        try {
            const result = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .query(query);

            const centres = result.recordsets[0];
            const total = result.recordsets[1][0].total;
            const totalPages = Math.ceil(total / limit);

            // console.log(centres)

            return {page, limit, total, totalPages, data: centres};
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }


    // Rechercher un CentreAnalytique
    async get_onecentre (idcentreanalytique) {
        const pool = await connectDB();
        try {
            const result = await pool.request().input("idcentreanalytique", idcentreanalytique)
            .query("SELECT * FROM CentreAnalytique WHERE idcentreanalytique = @idcentreanalytique");
            const centre = result.recordset[0];
            let societe = null;
            if (centre.idsociete) {
                societe = await societemodel.get_onesociete(centre.idsociete);
            }
            return {...centre, societe : societe};
        } catch (error) {
            return { success: false, message: error.message };
        }
    }


    // Met à jour un centre
    async update_centre (idcentreanalytique, data) {
        const pool = await connectDB();
        try {
            const check = await pool.request().input('codecentreanalytique', data.codecentreanalytique)
            .query(`SELECT COUNT(*) AS count FROM CentreAnalytique WHERE codecentreanalytique = @codecentreanalytique`);

            // S'il existe aumoins une ligne, update
            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('idcentreanalytique', idcentreanalytique)
                    .input('codecentreanalytique', sql.NVarChar(50), data.codecentreanalytique)
                    .input('libelle', sql.NVarChar(150), data.libelle)
                    .input('actif', sql.Int, data.actif)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(50), data.updatedby)
                    .query(queryUpdate);
                return result;
            } else {
                // Sinon insert
                const result = await pool.request()
                    .input('idcentreanalytique', sql.UniqueIdentifier, uuidv4())
                    .input('codecentreanalytique', sql.NVarChar(50), data.codecentreanalytique)
                    .input('libelle', sql.NVarChar(150), data.libelle)
                    .input('actif', sql.Int, data.actif)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
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

    
    // Supprimer un centreanalytique
    async delete_centre(idcentreanalytique) {
        const pool = await connectDB();

        // 1. Vérifier si le centre existe
        const check = await pool.request()
            .input("idcentreanalytique", sql.UniqueIdentifier, idcentreanalytique)
            .query("SELECT idcentreanalytique FROM CentreAnalytique WHERE idcentreanalytique = @idcentreanalytique");

        if (check.recordset.length === 0) {
            return {
                message: "Centre analytique inexistant."
            };
        }

        // 2. Supprimer le centre
        try {
            await pool.request()
                .input("idcentreanalytique", sql.UniqueIdentifier, idcentreanalytique)
                .query("DELETE FROM CentreAnalytique WHERE idcentreanalytique = @idcentreanalytique");
            return { success: true, message: "Centre analytique supprimé avec succès." };
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
            return {success: false, message: "Erreur de suppression : " + error.message };
        }
    }
}

module.exports = CentreAnalytiqueModel;