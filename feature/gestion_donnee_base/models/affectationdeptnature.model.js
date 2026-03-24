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
            .query(`SELECT n.idnature, n.codenature, n.libelle, n.actif, n.demandedecaissement, n.imputationtiers
                FROM NatureOperation n INNER JOIN AffectationDepartementNature a
                ON a.idnature = n.idnature
                WHERE a.iddepartement = @iddepartement
                ORDER BY n.libelle ASC`);

        // Natures non affectées
        const resultNonAffectes = await pool.request()
            .input("iddepartement", sql.UniqueIdentifier, iddepartement)
            .query(`SELECT n.idnature, n.codenature, n.libelle, n.actif
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

    
    async saveAffectations(iddepartement, data) {

        // console.log(iddepartement)

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
            for (const ligne of data) {
                await transaction.request()
                    .input('idaffdepartementnature', sql.UniqueIdentifier, uuidv4())
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('iddepartement', sql.UniqueIdentifier, iddepartement)
                    .input('idnature', sql.UniqueIdentifier, ligne.idnature)
                    .input('createdat', sql.DateTime, new Date())
                    .input('updatedat', sql.DateTime, new Date())
                    .input('createdby', sql.NVarChar(50), data.createdby)
                    .input('updatedby', sql.NVarChar(50), data.updatedby)
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


module.exports = AffectationDepartementNatureModel;
