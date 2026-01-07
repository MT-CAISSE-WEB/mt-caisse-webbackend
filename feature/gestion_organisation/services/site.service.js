const { DateTime, UniqueIdentifier } = require('mssql');
const {db, sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

 //upsert Site
   async function upsertsite({idsociete,codesite,libelle ,email,telephone,adresse,estcentreanalytique,createdby, updatedby }) {
    try {
        const idsite = uuidv4();

        const query = `
            IF EXISTS (SELECT 1 FROM Site WHERE codesite = @codesite)
            BEGIN
                UPDATE Site
                SET 
                    idsociete = @idsociete,
                    libelle = @libelle,
                    email   = @email,
                    telephone = @telephone,
                    adresse = @adresse,
                    updatedby = @updatedby,
                    updatedat = GETDATE()
                OUTPUT INSERTED.*
                WHERE codesite = @codesite
            END
            ELSE
            BEGIN
                INSERT INTO Site (idsite,idsociete,codesite,libelle ,email,telephone,adresse,createdby,createdat)
                OUTPUT INSERTED.*
                VALUES (@idsite,@idsociete,@codesite,@libelle ,@email,@telephone,@adresse,@createdby,GETDATE())
            END
        `;

        const pool = await connectDB();
        const result = await pool.request()
            .input("idsite", sql.UniqueIdentifier, idsite)
            .input("idsociete", sql.UniqueIdentifier,idsociete)
            .input("codesite", sql.NVarChar, codesite)
            .input("libelle", sql.NVarChar,libelle)
            .input("email", sql.NVarChar,email)
            .input("telephone", sql.NVarChar,telephone)
            .input("adresse", sql.NVarChar,adresse)
            .input("createdby", sql.NVarChar, createdby)
            .input("updatedby", sql.NVarChar, updatedby)
            .query(query);

        return {
            success: true,
            status: 200,
            message: result.rowsAffected[0] === 1
                ? "Site mise à jour avec succès !"
                : "Site créé avec succès !",
            data: result.recordset[0]
        };

    } catch (error) {
        return {
            success: false,
            status: 500,
            message: `Erreur lors de l'opération : ${error}`.cyan.bold
        };
    }
}

// Get all
async function getallsite(){
    try {
        const pool = await connectDB();
        const query = "SELECT s.*,so.raisonsociale FROM Site s LEFT JOIN Societe so ON s.idsociete = so.idsociete";
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
async function getonesite(idsite){
    try {
        const pool = await connectDB();
        const query = "SELECT * FROM Site where idsite = @idsite";
        const result = await pool.request()
        .input('idsite', sql.UniqueIdentifier,idsite)
        .query(query);

        if(!result){
            return {success:false,status:404,message:"Site non trouvé"};
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

  //Delete Site
  async function deletesite(idsite)
  {
      
      try {
          const pool = await db.connectDB();
          const query = "DELETE FROM Sites where idsite = @idsite";
          const result = await pool.request()
          .input('idsite',db.sql.UniqueIdentifier,idsite)
          .query(query);
          return {success:true,status:200,message:"Suppression effectuée avec succès!"}
      } catch (error) {
          return {success:false,status:500,message:`Erreur lors de la suppression : ${error}`.cyan.bold}; 
      }
  }

  module.exports = {
    upsertsite,
    getallsite,
    getonesite,
    deletesite
  }

  