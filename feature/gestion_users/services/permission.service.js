const db = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config({path: '../../../config/config.env'});
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

async function upsertpermission(params){
    try {
        const pool = await db.poolPromise;
        const {code,description, createdby,updatedby} = params;
        const query = ` IF EXISTS (SELECT 1 FROM permission WHERE code = @code)
                        BEGIN
                            UPDATE permission SET
                                description = @description,
                                updatedby = @updatedby,
                                updatedat = GETDATE()
                            OUTPUT 'update' AS action, INSERTED.*
                            WHERE code = @code;
                        END
                        ELSE
                        BEGIN
                            INSERT INTO permission (code,description, createdby, createdat)
                            OUTPUT 'insert' AS action, INSERTED.*
                            VALUES (@code, @description, @createdby, GETDATE());
                        END
                        `;
        const result = await pool.request()
            .input('code', db.sql.NVarChar(50), code)    
            .input('description', db.sql.NVarChar(50), description)
            .input('createdby', db.sql.NVarChar(50), createdby)
            .input('updatedby', db.sql.NVarChar(50), updatedby)
            .query(query);
        const data = result.recordset[0];
        return {
            success: true,
            status: 200,
            message: data.action === "update"
                ? "Permission mise à jour avec succès !"
                : "Permission créée avec succès !",
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

async function getAllPermissions(){
    try {
        const pool = await db.poolPromise;
        const query = `SELECT * FROM permission`;
        const result = await pool.request().query(query);
        return {
            success: true,
            status: 200,
            message: "Permissions récupérées avec succès !",
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

async function getpermissionbyid(idpermission){
    try {
        const pool = await db.poolPromise;
        const query = `SELECT * FROM permission WHERE idpermission = @idpermission`;
        const result = await pool.request()
            .input('idpermission', db.sql.Int, idpermission)
            .query(query);  
        return {
            success: true,
            status: 200,
            message: "Permission récupérée avec succès !",
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

async function deletepermission(idpermission){
    try {
        const pool = await db.poolPromise;
        const query = `DELETE FROM permission WHERE idpermission = @idpermission`;      
        await pool.request()
            .input('idpermission', db.sql.Int, idpermission)
            .query(query);  
        return {
            success: true,
            status: 200,
            message: "Permission supprimée avec succès !"
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
    upsertpermission,
    getAllPermissions,
    getpermissionbyid,
    deletepermission
};