const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');


const queryInsert = `
        INSERT INTO AffectationDepartementNature (idaffdepartementnature, iddepartement,
         idnature, idsociete, createdat, createdby, updatedat, updatedby) 
    OUTPUT INSERTED.*
    VALUES ( @idaffdepartementnature, @iddepartement, @idnature, @idsociete,
    @createdat, @createdby, @updatedat, @updatedby)
    `;


// Model AffectationDepartementNature
class AffectationDepartementNatureModel {
    constructor(idaffdepartementnature, idsociete, iddepartement, idnature,
        createdat, updatedat, createdby, updatedby)
    {
        this.idaffdepartementnature = idaffdepartementnature;
        this.idsociete = idsociete;
        this.iddepartement = iddepartement;    
        this.idnature = idnature;
        this.createdat = createdat;
        this.updatedat = updatedat;
        this.createdby = createdby;
        this.updatedby = updatedby;
    }


    // ok 
    async getallNatures(iddepartement) {

        const pool = await connectDB();

        try {
            // Natures affectées
            const resultAffectes = await pool.request()
                .input("iddepartement", sql.UniqueIdentifier, iddepartement)
                .query(`SELECT n.idnature, n.codenature, n.libelle, n.decajustifier, n.actif, n.demandedecaissement, n.imputationtiers
                    FROM NatureOperation n INNER JOIN AffectationDepartementNature a
                    ON a.idnature = n.idnature
                    WHERE a.iddepartement = @iddepartement
                    ORDER BY n.libelle ASC`);

            // Natures non affectées
            const resultNonAffectes = await pool.request()
                .input("iddepartement", sql.UniqueIdentifier, iddepartement)
                .query(`SELECT n.idnature, n.codenature, n.libelle, decajustifier, n.actif
                    FROM NatureOperation n WHERE n.actif = 1 AND NOT EXISTS (
                        SELECT 1 FROM AffectationDepartementNature a
                        WHERE a.idnature = n.idnature AND a.iddepartement = @iddepartement)
                        ORDER BY n.libelle ASC`);
            const naturesaffectes = resultAffectes.recordset;
            const naturesnonaffectes = resultNonAffectes.recordset;

            return {success: true, naturesaffectes, naturesnonaffectes};

        } catch (error) {
            return { success: false, message: error.message};}
    }

    
    async saveAffectations(iddepartement, idsNatures, info) {
        const pool = await connectDB();
        const transaction = new sql.Transaction(pool);

        try {    
            await transaction.begin();

            // 1️⃣ Supprimer les anciennes affectations
            await transaction.request()
                .input("iddepartement", sql.UniqueIdentifier, iddepartement)
                .query(`DELETE FROM AffectationDepartementNature 
                    WHERE iddepartement = @iddepartement
                `);

            // 2️⃣ Insérer les nouvelles affectations
            for (const idnature of idsNatures) {
                await transaction.request()
                    .input('idaffdepartementnature', sql.UniqueIdentifier, uuidv4())
                    .input('idsociete', sql.UniqueIdentifier, info.idsociete)
                    .input('iddepartement', sql.UniqueIdentifier, iddepartement)
                    .input('idnature', sql.UniqueIdentifier, idnature.idnature)
                    .input('createdat', sql.DateTime, new Date())
                    .input('updatedat', sql.DateTime, new Date())
                    .input('createdby', sql.NVarChar(50), info.createdby)
                    .input('updatedby', sql.NVarChar(50), info.createdby)
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

    async exportAffDepartements(debut, fin) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('debut', sql.NVarChar, debut || null)
            .input('fin', sql.NVarChar, fin || null)
            .query(`SELECT d.codedept, d.libelle, n.codenature, n.libelle as libellenature
                    FROM NatureOperation n 
                    INNER JOIN AffectationDepartementNature a ON a.idnature = n.idnature
                    JOIN Departement d ON d.iddepartement = a.iddepartement
                    WHERE (@debut IS NULL OR d.codedept >= @debut) 
                    AND (@fin IS NULL OR d.codedept <= @fin)
                    ORDER BY n.libelle ASC`);

        const data = result.recordset;

        return data;
    }

}


module.exports = AffectationDepartementNatureModel;
