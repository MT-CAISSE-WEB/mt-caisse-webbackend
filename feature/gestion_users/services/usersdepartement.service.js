const db = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config({path: '../../../config/config.env'});

async function getutilisateurdepartement(idutilisateur){
    try {
        const pool = await db.poolPromise;
        const query =`select * from utilisateurdepartement
                      WHERE idutilisateur = @idutilisateur`;

        const result = await pool.request()
                       .input("idutilisateur", db.sql.UniqueIdentifier,idutilisateur)
                       .query(query);

     return {
            success: true,
            status: 200,
            message: "Departement récupérés avec succès !",
            data: result.recordsets
        };
    } 
    catch (error) {
         return {
            success: false,
            status: 500,
            message: `Erreur de l'opération : ${error}`
        };
    }
}

async function upsertutilisateurdept(params){
    try {
        const pool = await db.poolPromise;
        const {idutilisateur, iddepartement, createdby, updatedby} = params;
        const query = ` IF EXISTS (SELECT 1 FROM utilisateurdepartement WHERE idutilisateur = @idutilisateur AND iddepartement = @iddepartement)
         BEGIN
            UPDATE  utilisateurdepartement SET
                idutilisateur = @idutilisateur,
                iddepartement = @iddepartement,
                updatedby = @updatedby,
                updatedat = GETDATE()
                OUTPUT 'update' AS action, INSERTED.*
            WHERE idutilisateur = @idutilisateur AND  iddepartement = @iddepartement 
         END
         ELSE
         BEGIN
            INSERT INTO  utilisateurdepartement (idutilisateur,iddepartement,createdby,createdat)
            OUTPUT 'insert' AS action, INSERTED.*
            VALUES (@idutilisateur,@iddepartement, @createdby, GETDATE())
         END`;

        const result = await pool.request()
            .input('idutilisateur',db.sql.UniqueIdentifier, idutilisateur)
            .input('iddepartement',db.sql.UniqueIdentifier, iddepartement)
            .input('createdby', db.sql.NVarChar(50), createdby)
            .input('updatedby', db.sql.NVarChar(50), updatedby)
            .query(query);
        const data = result.recordset[0];
        return {
            success: true,
            status: 200,
            message: data.action === "update"
                ? "Role mise à jour avec succès !"
                : "Role créée avec succès !",
            data
        };
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: `Erreur de l'opération : ${error}`
        };
        
    }
}

async function getAllutilisateurdept(){
    try {
        const pool = await db.poolPromise;
        const query = `SELECT ud.*, r.code,d.codedept,d.libelle,d.responsable,u.nom,u.prenom
                       FROM utilisateurdepartement ud
                       left JOIN utilisateur u ON ur.idutilisateur = u.idutilisateur
                       left JOIN departement d ON ud.iddepartement = d.iddepartement
                       `;
        const result = await pool.request().query(query);  
        return {
            success: true,
            status: 200,
            message: "Rôle et utlisateurs récupérées avec succès !",
            data: result.recordset
        };
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: `Erreur de l'opération : ${error}`
        }; 
    }   

}

async function deleteutilisateurdept(idutilisateur,iddepartement){
    try {
        const pool = await db.poolPromise;
        const query = `DELETE FROM utilisateurdepartement WHERE idutilisateur = @idutilisateur AND iddepartement = @iddepartement`;
        await pool.request()
            .input('idutilisateur', db.sql.UniqueIdentifier, idutilisateur)
            .input('iddepartement', db.sql.UniqueIdentifier, iddepartement)
            .query(query);  
        return {
            success: true,
            status: 200,
            message: "Departement user supprimé avec succès !"
        };
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: `Erreur de l'opération : ${error}`
        }; 
    }
}


module.exports = {
    getutilisateurdepartement,
    upsertutilisateurdept,
    getAllutilisateurdept,
    deleteutilisateurdept
}
