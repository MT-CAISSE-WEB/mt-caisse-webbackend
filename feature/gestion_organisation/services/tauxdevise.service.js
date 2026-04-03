const { DateTime, UniqueIdentifier } = require('mssql');
const db = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const {connectInstance, connectDB} = require('../../../config/db');


const today = new Date();

//Upsert 
async function upserttauxdevise({iddeviseorigine,iddevisedestination,codetauxdevise,intitule,typecours,datecours,coefficient,coefficientinverse,createdby,updatedby}){
    try {
        const idtauxdevise = uuidv4();

        const query = `
            IF EXISTS (SELECT 1 FROM tauxdevise WHERE codetauxdevise = @codetauxdevise)
            BEGIN
                UPDATE tauxdevise
                SET  iddeviseorigine= @iddeviseorigine,
                     iddevisedestination = @iddevisedestination,
                     codetauxdevise = @codetauxdevise,
                     intitule = @intitule,
                     typecours = @typecours,
                     datecours = @datecours,
                     coefficient = @coefficient,
                     coefficientinverse = @coefficientinverse,
                     updatedat = GETDATE(),
                     updatedby = @updatedby
                OUTPUT INSERTED.*
                WHERE codetauxdevise = @codetauxdevise
            END
            ELSE
            BEGIN
                INSERT INTO tauxdevise (iddeviseorigine,iddevisedestination,codetauxdevise,intitule,typecours,datecours,coefficient,coefficientinverse,createdat,createdby)
                OUTPUT INSERTED.*
                VALUES (@iddeviseorigine, @iddevisedestination, @codetauxdevise, @intitule, @typecours, @datecours, @coefficient,@coefficientinverse,GETDATE(),@createdby)
            END
        `;

        const pool = await connectDB();
        const result = await pool.request()
            .input("idtauxdevise", db.sql.UniqueIdentifier, idtauxdevise)
            .input("iddeviseorigine", db.sql.UniqueIdentifier,iddeviseorigine)
            .input("iddevisedestination", db.sql.UniqueIdentifier,iddevisedestination)
            .input("codetauxdevise", db.sql.NVarChar,codetauxdevise)
            .input("intitule", db.sql.NVarChar, intitule)
            .input("typecours", db.sql.NVarChar, typecours)
            .input("datecours", db.sql.DateTime,datecours)
            .input("coefficient", db.sql.Decimal(18,9), coefficient)
            .input("coefficientinverse", db.sql.Decimal(18,9), coefficientinverse)
            .input("createdby", db.sql.NVarChar, createdby)
            .input("updatedby",db.sql.NVarChar,updatedby)
            .query(query);

            return {
            success: true,
            status: 200,
            message: result.rowsAffected[0] === 1
                ? "Taux Devise mise à jour avec succès !"
                : "Taux Devise créée avec succès !",
            data: result.recordset[0]
        };
        
        
    } catch (error) {
        console.log(error)
         return {
            success: false,
            status: 500,
            message: `Erreur lors de l'opération : ${error}`.cyan.bold
        };
    }
}

// Get all
async function getalltauxdevises(){
    try {
        const pool = await connectDB();
        const query =`
    SELECT 
        t.*, 
        d1.codeiso AS devise_origine,
        d2.codeiso AS devise_destination
    FROM Tauxdevise t
    JOIN Devise d1 ON t.iddeviseorigine = d1.iddevise
    JOIN Devise d2 ON t.iddevisedestination = d2.iddevise
`;
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

async function getalldevisesactif(){
    try {
          const pool = await connectDB();
          const query = "SELECT * FROM devise where actif=1"; 
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
async function getonetauxdevise(idtauxdevise){
    try {
        const pool = await connectDB();
        const query = "SELECT * FROM tauxDevise where idtauxdevise = @idtauxdevise";
        const result = await pool.request()
        .input('idtauxdevise',db.sql.UniqueIdentifier,idtauxdevise)
        .query(query);

        if(!result){
            return {success:false,status:404,message:"Taux Dévise non trouvé"};
        }

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
async function deletetauxdevise(idtauxdevise)
{
    
    try {
        const pool = await connectDB();
        const query = "DELETE FROM tauxdevise where idtauxdevise = @idtauxdevise";
        const result = await pool.request()
        .input('idtauxdevise',db.sql.UniqueIdentifier,idtauxdevise)
        .query(query);
        return {success:true,status:200,message:"Suppression effectuée avec succès!"}
    } catch (error) {
        return {success:false,status:500,message:`Erreur lors de la suppression : ${error}`.cyan.bold}; 
    }
}

module.exports = {
    upserttauxdevise,
    getalltauxdevises,
    getonetauxdevise,
    deletetauxdevise,
    getalldevisesactif
}