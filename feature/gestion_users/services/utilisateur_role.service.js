const db = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config({path: '../../../config/.env'});

async function getutilisateurrole(idutilisateur){
    try {
        const pool = await db.poolPromise;
        const query =`select * from utilisateur_role
                      WHERE idutilisateur = @idutilisateur`;

        const result = await pool.request()
                       .input("idutilisateur", db.sql.UniqueIdentifier,idutilisateur)
                       .query(query);

     return {
            success: true,
            status: 200,
            message: "Rôles récupérés avec succès !",
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

async function upsertutilisateurrole(params){
    try {
        const pool = await db.poolPromise;
        const {idutilisateur, idrole, createdby, updatedby} = params;
        const query = ` IF EXISTS (SELECT 1 FROM utilisateur_role WHERE idutilisateur = @idutilisateur AND idrole = @idrole)
         BEGIN
            UPDATE  utilisateur_role SET
                idutilisateur = @idutilisateur,
                idrole = @idrole,
                updatedby = @updatedby,
                updatedat = GETDATE()
                OUTPUT 'update' AS action, INSERTED.*
            WHERE idutilisateur = @idutilisateur AND  idrole = @idrole 
         END
         ELSE
         BEGIN
            INSERT INTO  utilisateur_role (idutilisateur,idrole,createdby, createdat)
            OUTPUT 'insert' AS action, INSERTED.*
            VALUES (@idutilisateur,@idrole, @createdby, GETDATE())
         END`;

        const result = await pool.request()
            .input('idutilisateur',db.sql.UniqueIdentifier, idutilisateur)
            .input('idrole',db.sql.Int, idrole)
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

async function getAllutilisateurrole(){
    try {
        const pool = await db.poolPromise;
        const query = `SELECT ur.*, r.code,r.libelle,u.nom,u.prenom
                       FROM utilisateur_role ur
                       left JOIN utilisateur u ON ur.idutilisateur = u.idutilisateur
                       left JOIN role r ON ur.idrole = r.idrole
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

async function deleteutilisateurrole(idutilisateur,idrole){
    try {
        const pool = await db.poolPromise;
        const query = `DELETE FROM utilisateur_role WHERE idutilisateur = @idutilisateur AND idrole = @idrole`;
        await pool.request()
            .input('idutilisateur', db.sql.UniqueIdentifier, idutilisateur)
            .input('idrole', db.sql.Int, idrole)
            .query(query);  
        return {
            success: true,
            status: 200,
            message: "Role user supprimé avec succès !"
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
    getutilisateurrole,
    upsertutilisateurrole,
    getAllutilisateurrole,
    deleteutilisateurrole
}