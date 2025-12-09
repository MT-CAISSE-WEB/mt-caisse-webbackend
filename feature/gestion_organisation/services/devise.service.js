const { DateTime, UniqueIdentifier } = require('mssql');
const db = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');


const queryinsert = `
        INSERT INTO Devise (iddevise,codedevise,intitule,codeiso,actif,createdby,createdat)
        OUTPUT INSERTED.*
        VALUES (@iddevise, @code, @intitule, @codeiso, @actif, @createdby, @createdat)
        `;
const queryupdate = `UPDATE Devise SET intitule = @intitule, codeiso = @codeiso, actif = @actif, updatedby = @updatedby,updatedat = @updatedat
OUTPUT INSERTED.* 
WHERE code = @code`;

 const today = new Date();

//Create devise
async function createdevise(data){
        
        try {
            const pool = await db.poolPromise;
            const iddevise = uuidv4();
            const result = await pool.request()
            .input('iddevise',db.sql.UniqueIdentifier,iddevise)
            .input ('code',db.sql.NVarChar(50),data.code)
            .input ('codeiso',db.sql.NVarChar(50),data.codeiso)
            .input ('intitule',db.sql.NVarChar(50),data.intitule)
            .input ('actif',db.sql.Int,data.actif)
            .input ('createdat',db.sql.DateTime,today)
            .input ('createdby',db.sql.NVarChar(50),data.createdby)
            .query(queryinsert);

            return {
                success:true,
                status:201,
                data: result.recordset[0],
                message: "Création effectuée avec succès!"
            }
        } catch (error) {
            return { success: false, status:500, message:`Erreur lors de la création : ${error}`.cyan.bold};
        }
    }

    //upsert devise
   async function upsertdevise({ codedevise, intitule, codeiso, actif, createdby,updatedby }) {
    try {
        const iddevise = uuidv4();

        const query = `
            IF EXISTS (SELECT 1 FROM devise WHERE codedevise = @codedevise)
            BEGIN
                UPDATE devise
                SET intitule = @intitule,
                    codeiso = @codeiso,
                    actif = @actif,
                    updatedby = @updatedby,
                    updatedat = GETDATE()
                OUTPUT INSERTED.*
                WHERE codedevise = @codedevise
            END
            ELSE
            BEGIN
                INSERT INTO devise (iddevise, codedevise, intitule, codeiso, actif, createdby, createdat)
                OUTPUT INSERTED.*
                VALUES (@iddevise, @codedevise, @intitule, @codeiso, @actif, @createdby, GETDATE())
            END
        `;

        const pool = await db.poolPromise;
        const result = await pool.request()
            .input("iddevise", db.sql.UniqueIdentifier, iddevise)
            .input("codedevise", db.sql.NVarChar, codedevise)
            .input("intitule", db.sql.NVarChar, intitule)
            .input("codeiso", db.sql.NVarChar, codeiso)
            .input("actif", db.sql.Int, actif)
            .input("createdby", db.sql.NVarChar, createdby)
            .input("updatedby", db.sql.NVarChar, updatedby )
            .query(query);

        return {
            success: true,
            status: 200,
            message: result.rowsAffected[0] === 1
                ? "Devise mise à jour avec succès !"
                : "Devise créée avec succès !",
            data: result.recordset[0]
        };

    } catch (error) {
        return {
            success: false,
            status: 500,
            message: `Erreur de recuperation: ${error}`.cyan.bold
        };
    }
}


     // Get all
    async function getalldevises(){
        try {
            const pool = await db.poolPromise;
            const query = "SELECT * FROM Devise";
            const result = await pool.request().query(query);
            return {
                success :true,
                status:200, 
                data : result.recordsets[0],
                message : "Eléments trouvés avec succès!"}
        } catch (error) {
            return {success:false,status:500,message:`Erreur de recuperation: ${error}`.cyan.bold};
        }
    }


    //Get one
    async function getonedevise(iddevise){
        try {
            const pool = await db.poolPromise;
            const query = "SELECT * FROM Devise where iddevise = @iddevise";
            const result = await pool.request()
            .input('iddevise',db.sql.UniqueIdentifier,iddevise)
            .query(query);

            if(!result){
                return {success:false,status:404,message:"Dévise non trouvée"};
            }

            console.log(result.recordset[0]);

            return {
                success:true,
                status:200,
                data:result.recordset[0],
                message : "Element trouvé avec succès!"}
        } catch (error) {
            return {success:false,status:500,message:`Erreur de recuperation: ${error}`.cyan.bold};
        }
    }

     //Delete Dévise
    async function deletedevise(iddevise)
    {
        
        try {
            const pool = await db.poolPromise;
            const query = "DELETE FROM Devise where iddevise = @iddevise";
            const result = await pool.request()
            .input('iddevise',db.sql.UniqueIdentifier,iddevise)
            .query(query);
            return {success:true,status:200,message:"Suppression effectuée avec succès!"}
        } catch (error) {
           return {success:false,status:500,message:`Erreur lors de la suppression : ${error}`.cyan.bold}; 
        }
    }

    module.exports = {
        upsertdevise,
        getalldevises,
        getonedevise,
        deletedevise
    }

