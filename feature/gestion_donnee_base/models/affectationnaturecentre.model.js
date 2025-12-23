const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

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

    // ok 
    async getallCentres(idnature) {

    const pool = await connectDB();

    try {
        // Centres affectés
        const resultAffectes = await pool.request()
            .input("idnature", sql.UniqueIdentifier, idnature)
            .query(`SELECT c.idcentreanalytique, c.codecentreanalytique, c.libelle
                FROM CentreAnalytique c INNER JOIN AffectationNatureCentre a
                ON a.idcentreanalytique = c.idcentreanalytique
                WHERE a.idnature = @idnature
                ORDER BY c.codecentreanalytique ASC`);

        // Centres non affectés
        const resultNonAffectes = await pool.request()
            .input("idnature", sql.UniqueIdentifier, idnature)
            .query(`SELECT c.idcentreanalytique, c.codecentreanalytique, c.libelle
                FROM CentreAnalytique c WHERE NOT EXISTS (
                    SELECT 1 FROM AffectationNatureCentre a
                    WHERE a.idcentreanalytique = c.idcentreanalytique AND a.idnature = @idnature)
                    ORDER BY c.codecentreanalytique ASC`);

        const centresaffectes = resultAffectes.recordset;
        const centresnonaffectes = resultNonAffectes.recordset;

        return {success: true, centresaffectes, centresnonaffectes};

    } catch (error) {
        return { success: false, message: error.message};}
    }


    async saveAffectations(idnature, idsCentres) {

        const pool = await connectDB();
        const transaction = new sql.Transaction(pool);

        try {    
            await transaction.begin();

            // 1️⃣ Supprimer les anciennes affectations
            await transaction.request()
                .input("idnature", sql.UniqueIdentifier, idnature)
                .query(`
                    DELETE FROM AffectationNatureCentre 
                    WHERE idnature = @idnature
                `);

            // 2️⃣ Insérer les nouvelles affectations
            for (const idcentre of idsCentres) {
                await transaction.request()
                    .input('idaffnaturecentre', sql.UniqueIdentifier, uuidv4())
                    .input('idsociete', sql.UniqueIdentifier, idcentre.idsociete)
                    .input('idnature', sql.UniqueIdentifier, idnature)
                    .input('idcentreanalytique', sql.UniqueIdentifier, idcentre.idcentreanalytique)
                    .input('createdat', sql.DateTime, new Date())
                    .input('updatedat', sql.DateTime, null)
                    .input('createdby', sql.NVarChar(50), this.createdby)
                    .input('updatedby', sql.NVarChar(50), this.updatedby)
                    .query(queryInsert);
            }

            await transaction.commit();

            return {
                success: true,
                message: "Affectations enregistrées avec succès."
            };

        } catch (error) {
            await transaction.rollback();
            console.error("Erreur saveAffectations :", error);

            return {
                success: false,
                message: error.message
            };
        }
    }

}


module.exports = AffectationNatureCentreModel;