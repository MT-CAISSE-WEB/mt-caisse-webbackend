const { DateTime, UniqueIdentifier } = require('mssql');
const db = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

 //upsert Societe
<<<<<<< HEAD
   async function upsertsociete({codesociete,iddevisereference,iddevisereporting,raisonsociale,sigle, rccm, numnui, email, telephone, logo, adresse, suivibudgetaire,createdby, updatedby }) {
=======
   async function upsertsociete({codesociete, iddevisereference, iddevisereporting, raisonsociale, rccm, numnui, email, telephone, logo, adresse, suivibudgetaire,createdby, updatedby }) {
>>>>>>> origin/richard
    try {
        const idsociete = uuidv4();

        const query = `
            IF EXISTS (SELECT 1 FROM societe WHERE codesociete = @codesociete)
            BEGIN
                UPDATE societe
                SET raisonsociale = @raisonsociale,
                     sigle = @sigle,
                     iddevisereference = @iddevisereference,
                     iddevisereporting = @iddevisereporting,
                     rccm = @rccm,
                     numnui = @numnui,
                     email = @email,
                     telephone = @telephone,
                     logo =@logo,
                     adresse =@adresse,
                     suivibudgetaire = @suivibudgetaire,
                     updatedby = @updatedby,
                     updatedat = GETDATE()
                OUTPUT 'update' AS action, INSERTED.*
                WHERE codesociete = @codesociete
            END
            ELSE
            BEGIN
                INSERT INTO societe (idsociete,iddevisereference,iddevisereporting,codesociete, raisonsociale,sigle, rccm, numnui, email, telephone, logo, adresse, suivibudgetaire,createdby,createdat)
                OUTPUT 'insert' AS action, INSERTED.*
                VALUES (@idsociete,@iddevisereference,@iddevisereporting,@codesociete, @raisonsociale,@sigle, @rccm, @numnui, @email,@telephone,@logo,@adresse,@suivibudgetaire,@createdby,GETDATE())
            END
        `;

        const pool = await db.connectDB();
        const result = await pool.request()
            .input("idsociete", db.sql.UniqueIdentifier, idsociete)
            .input("codesociete", db.sql.NVarChar, codesociete)
<<<<<<< HEAD
            .input("iddevisereference", db.sql.NVarChar, iddevisereference)
            .input("iddevisereporting", db.sql.NVarChar, iddevisereporting)
=======

>>>>>>> origin/richard
            .input("raisonsociale", db.sql.NVarChar, raisonsociale)
            .input("sigle", db.sql.NVarChar,sigle)
            .input("rccm", db.sql.NVarChar, rccm)
            .input("numnui", db.sql.NVarChar, numnui)
            .input("email", db.sql.NVarChar, email)
            .input("telephone", db.sql.NVarChar, telephone)
            .input("logo", db.sql.NVarChar,logo)
            .input("adresse", db.sql.NVarChar,adresse)
            .input("suivibudgetaire", db.sql.Int,suivibudgetaire)
            .input("createdby", db.sql.NVarChar, createdby)
            .input("updatedby", db.sql.NVarChar, updatedby)
            .query(query);

        return {
            success: true,
            status: 200,
            message:  result.recordset[0].action === "update"
                ? "Société mise à jour avec succès !"
                : "Société créée avec succès !",
            data: result.recordset[0]
        };

    } catch (error) {
        console.log(error);
        return {
            success: false,
            status: 500,
            message: `Erreur de l'opération : ${error}`.cyan.bold
        };
    }
}

 // Get all
async function getallsociete(){
    try {
<<<<<<< HEAD
        const pool = await db.poolPromise;
        const query = `SELECT s.*,
        d1.codeiso AS devise_reference,
        d2.codeiso AS devise_reporting FROM Societe s
        left join devise d1 on s.iddevisereference = d1.iddevise
        left join devise d2 on s.iddevisereporting = d2.iddevise`;
=======
        const pool = await db.connectDB();
        const query = "SELECT * FROM Societe";
>>>>>>> origin/richard
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

 // Get all
async function getalldevisesactif(){
    try {
        const pool = await db.poolPromise;
        const query = `SELECT * FROM DEVISE WHERE ACTIF=1`;
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
async function getonesociete(idsociete){
    try {
        const pool = await db.poolPromise;
        const query = "SELECT * FROM Societe where idsociete = @idsociete";
        const result = await pool.request()
        .input('idsociete',db.sql.UniqueIdentifier,idsociete)
        .query(query);

        if(!result){
            return {success:false,status:404,message:"Société non trouvée"};
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

     //Delete Societe
  async function deletesociete(idsociete)
  {
      
      try {
          const pool = await db.connectDB();
          const query = "DELETE FROM Societe where idsociete = @idsociete";
          const result = await pool.request()
          .input('idsociete',db.sql.UniqueIdentifier,idsociete)
          .query(query);
          return {success:true,status:200,message:"Suppression effectuée avec succès!"}
      } catch (error) {
          return {success:false,status:500,message:`Erreur lors de la suppression : ${error}`.cyan.bold}; 
      }
  }

  module.exports = {
    upsertsociete,
    getallsociete,
    getonesociete,
    deletesociete,
    getalldevisesactif
  }


