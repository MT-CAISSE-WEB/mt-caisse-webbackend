const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

const centreModel = require('./centreanalytique.model');
const natureModel = require('./natureoperation.model');
const centremodel = new centreModel()
const naturemodel = new natureModel()

const queryInsert = `
        INSERT INTO AffectationNatureCentre (idaffnaturecentre, idnature, 
        idcentreanalytique, idsociete,
        createdat, createdby, updatedat, updatedby) 
    OUTPUT INSERTED.*
    VALUES ( @idaffnaturecentre,
    @idnature, @idcentreanalytique, @idsociete,
    @createdat, @createdby, @updatedat, @updatedby)
    `;


// Model AffectationNatureCentre
class AffectationNatureCentreModel {
    constructor(idaffnaturecentre, idsociete, idnature, idcentreanalytique,
        createdat, updatedat, createdby, updatedby)
    {
        this.idaffnaturecentre = idaffnaturecentre;
        this.idsociete = idsociete;
        this.idnature = idnature;
        this.idcentreanalytique = idcentreanalytique;    
        this.createdat = createdat;
        this.updatedat = updatedat;
        this.createdby = createdby;
        this.updatedby = updatedby;
    }


    async getCentresNonAffectes(idnature) {
        const pool = await connectDB();

        try {
            const result = await pool.request()
            .input("idnature", sql.UniqueIdentifier, idnature)
            .query(`SELECT c.idcentreanalytique, c.codecentreanalytique, c.libelle
                FROM CentreAnalytique c
                WHERE NOT EXISTS (SELECT 1 FROM AffectationNatureCentre a
                WHERE a.idcentreanalytique = c.idcentreanalytique
                AND a.idnature = @idnature)`);

            const affectations = result.recordset[0];
            return {data : affectations };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }


    async getCentresAffectees(idnature) {
        const pool = await connectDB();

        try {
            const result = await pool.request()
            .input("idnature", sql.UniqueIdentifier, idnature)
            .query(`SELECT c.idcentreanalytique, c.codecentreanalytique, c.libelle
            FROM CentreAnalytique c
            JOIN AffectationNatureCentre a
                ON a.idcentreanalytique = c.idcentreanalytique
            WHERE a.idnature = @idnature
            `);

            const affectations = result.recordset[0];
            return {data : affectations };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }


    async saveAffectations(idnature, idsCentres) {
        const pool = await connectDB();

        const transaction = new sql.Transaction(pool);

        try {

            // Supprime les anciennes affectations
            await pool.request()
            .input("idnature", sql.UniqueIdentifier, idnature)
            .query(`DELETE FROM AffectationNatureCentre WHERE idnature = @idnature`);

            // Commencer la transaction
            await transaction.begin();

            // Insérer nouvelles
            for (const idcentre of idsCentres) {
            await transaction.request()
                .input('idaffnaturecentre', sql.UniqueIdentifier, this.idaffnaturecentre)
                .input('idsociete', sql.UniqueIdentifier, this.idsociete)
                .input('idnature', sql.UniqueIdentifier, idnature)
                .input('idcentreanalytique', sql.UniqueIdentifier, idcentre)
                .input('createdat', sql.DateTime, this.createdat)
                .input('updatedat', sql.DateTime, this.updatedat)
                .input('createdby', sql.NVarChar(50), this.createdby)
                .input('updatedby', sql.NVarChar(50), this.updatedby)
                .query(queryInsert);
            }

            await transaction.commit();
            return { success: true, message: "Affectations enregistrées avec succès." };

        } catch (error) {
        await transaction.rollback();
        console.error("Erreur saveAffectations :", error);
        throw error;
        }
    }

}


module.exports = AffectationNatureCentreModel;