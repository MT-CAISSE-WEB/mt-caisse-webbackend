const db = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config({path: '../../../config/config.env'});

async function upsertrole(params){
    try {
        const pool = await db.poolPromise;
        const {code,description, createdby,updatedby} = params;

        const query = ` IF EXISTS (SELECT 1 FROM role WHERE code = @code)
         BEGIN
            UPDATE role SET
                description = @description,
                updatedby = @updatedby,
                updatedat = GETDATE()
            OUTPUT 'update' AS action, INSERTED.*
            WHERE code = @code
         END
         ELSE
         BEGIN
            INSERT INTO role (code, description, createdby, createdat) 
            OUTPUT 'insert' AS action, INSERTED.*
            VALUES (@code, @description, @createdby, GETDATE())`;

        const result = await pool.request()
            .input('code',db.sql.NVarChar(50), code)
            .input('description',db.sql.NVarChar(50), description)
            .input('createdby', db.sql.NVarChar(50), createdby)
            .input('updatedby', db.sql.NVarChar(50), updatedby)
            .query(query);  


        const data = result.recordset[0];

        return {
            success: true,
            status: 200,
            message: data.action === "update"
                ? "Rôle mis à jour avec succès !"
                : "Rôle créé avec succès !",
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

async function getAllRoles(){
    try {
        const pool = await db.poolPromise;
        const query = `SELECT * FROM role`;
        const result = await pool.request().query(query);  
        return {
            success: true,
            status: 200,
            message: "Rôles récupérés avec succès !",
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

async function getRoleByid(idrole){ 
    try {
        const pool = await db.poolPromise;
        const query = `SELECT * FROM role WHERE idrole = @idrole`;
        const result = await pool.request()
            .input('idrole', db.sql.Int, idrole)
            .query(query);  
        return {
            success: true,
            status: 200,
            message: "Rôle récupéré avec succès !",
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

async function deleterole(idrole){
    try {
        const pool = await db.poolPromise;
        const query = `DELETE FROM role WHERE idrole = @idrole`;
        await pool.request()
            .input('idrole',db.sql.Int,idrole)
            .query(query);  
        return {
            success: true,
            status: 200,
            message: "Rôle supprimé avec succès !"
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
    upsertrole,
    getAllRoles,
    getRoleByid,
    deleterole
};