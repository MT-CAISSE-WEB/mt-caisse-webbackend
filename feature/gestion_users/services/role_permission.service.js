const db = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config({path: '../../../config/config.env'});

async function getpermissionbyrole(idrole){
    try {
        const pool = await db.poolPromise;
        const query =`select * from role_permission
                      WHERE idrole = @idrole`;

        const result = await pool.request()
                       .input("idrole", db.sql.Int,idrole)
                       .query(query);

     return {
            success: true,
            status: 200,
            message: "Permission de rôle récupérée avec succès !",
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

async function upsertrolepermission(params){
    try {
        const pool = await db.poolPromise;
        const {idrole, idpermission, createdby, updatedby} = params;
        const query = ` IF EXISTS (SELECT 1 FROM role_permission WHERE idrole = @idrole AND idpermission = @idpermission)
         BEGIN
            UPDATE role_permission SET
                idrole = @idrole,
                idpermission = @idpermission,
                updatedby = @updatedby,
                updatedat = GETDATE()
                OUTPUT 'update' AS action, INSERTED.*
            WHERE idrole = @idrole AND idpermission = @idpermission
         END
         ELSE
         BEGIN
            INSERT INTO role_permission (idrole, idpermission, createdby, createdat)
            OUTPUT 'insert' AS action, INSERTED.*
            VALUES (@idrole, @idpermission, @createdby, GETDATE())
         END`;

        const result = await pool.request()
            .input('idrole',db.sql.Int, idrole)
            .input('idpermission',db.sql.Int, idpermission)
            .input('createdby', db.sql.NVarChar(50), createdby)
            .input('updatedby', db.sql.NVarChar(50), updatedby)
            .query(query);
        const data = result.recordset[0];
        return {
            success: true,
            status: 200,
            message: data.action === "update"
                ? "Permission de rôle mise à jour avec succès !"
                : "Permission de rôle créée avec succès !",
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

async function getAllrolepermission(){
    try {
        const pool = await db.poolPromise;
        const query = `SELECT rp.*, r.code as role_code, p.code as permission_code
                       FROM role_permission rp
                       left JOIN role r ON rp.idrole = r.idrole
                       left JOIN permission p ON rp.idpermission = p.idpermission`;
        const result = await pool.request().query(query);  
        return {
            success: true,
            status: 200,
            message: "Permissions de rôle récupérées avec succès !",
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

async function deleterolepermission(idrole, idpermission){
    try {
        const pool = await db.poolPromise;
        const query = `DELETE FROM role_permission WHERE idrole = @idrole AND idpermission = @idpermission`;
        await pool.request()
            .input('idrole', db.sql.Int, idrole)
            .input('idpermission', db.sql.Int, idpermission)
            .query(query);  
        return {
            success: true,
            status: 200,
            message: "Permission de rôle supprimée avec succès !"
        };
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: `Erreur de l'opération : ${error}`
        }; 
    }
}

async function getrolepermissionByid(idrole, idpermission){ 
    try {
        const pool = await db.poolPromise;
        const query = `SELECT rp.*, r.code as role_code, p.code as permission_code
                       FROM role_permission rp
                       left JOIN role r ON rp.idrole = r.idrole
                       left JOIN permission p ON rp.idpermission = p.idpermission
                       WHERE rp.idrole = @idrole AND rp.idpermission = @idpermission`;
        const result = await pool.request()
            .input('idrole', db.sql.Int, idrole)
            .input('idpermission', db.sql.Int, idpermission)
            .query(query);  
        return {
            success: true,
            status: 200,
            message: "Permission de rôle récupérée avec succès !",
            data: result.recordset[0]
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
    upsertrolepermission,
    getAllrolepermission,
    deleterolepermission,
    getrolepermissionByid,
    getpermissionbyrole
};