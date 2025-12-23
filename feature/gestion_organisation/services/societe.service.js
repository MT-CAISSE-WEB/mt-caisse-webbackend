const { DateTime, UniqueIdentifier } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const db = require('../../../config/db');

 //upsert Societe
   async function upsertsociete({codesociete,iddevisereference,iddevisereporting,raisonsociale,sigle, rccm, numnui, email, telephone, logo, adresse, suivibudgetaire,createdby, updatedby }) {
    try {
        const idsociete = uuidv4();

        const query = `
            IF EXISTS (SELECT 1 FROM Societe WHERE codesociete = @codesociete)
            BEGIN
                UPDATE Societe
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
                INSERT INTO Societe (idsociete,iddevisereference,iddevisereporting,codesociete, raisonsociale,sigle, rccm, numnui, email, telephone, logo, adresse, suivibudgetaire,createdby,createdat)
                OUTPUT 'insert' AS action, INSERTED.*
                VALUES (@idsociete,@iddevisereference,@iddevisereporting,@codesociete, @raisonsociale,@sigle, @rccm, @numnui, @email,@telephone,@logo,@adresse,@suivibudgetaire,@createdby,GETDATE())
            END
        `;

        const pool = await connectDB();
        const result = await pool.request()
            .input("idsociete", db.sql.UniqueIdentifier, idsociete)
            .input("codesociete", db.sql.NVarChar, codesociete)
            .input("iddevisereference", db.sql.NVarChar, iddevisereference)
            .input("iddevisereporting", db.sql.NVarChar, iddevisereporting)
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
        const pool = await connectDB();
        const query = `SELECT s.*,
        d1.codeiso AS devise_reference,
        d2.codeiso AS devise_reporting FROM Societe s
        left join Devise d1 on s.iddevisereference = d1.iddevise
        left join Devise d2 on s.iddevisereporting = d2.iddevise`;
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
        const pool = await connectDB();
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
        const pool = await connectDB();
        const query = "SELECT * FROM Societe where idsociete = @idsociete";
        const result = await pool.request()
        .input('idsociete', sql.UniqueIdentifier,idsociete)
        .query(query);

        const data = result.recordset[0];
        let devisereporting = null;
        let devisereferentiel = null;
        if(data.iddevisereporting){
            devisereporting = await deviseservice.getonedevise(data.iddevisereporting);
        }
        if(data.iddevisereference){
            devisereferentiel = await deviseservice.getonedevise(data.iddevisereference);
        }

        if(!result){
            return {success:false,status:404,message:"Société non trouvée"};
        }
        return {
            success:true,
            status:200,
            data: {...data, devisereporting: devisereporting.data, devisereference : devisereferentiel.data},
            message : "Element trouvé avec succès!"}
    } catch (error) {
        return {success:false,status:500,message:`Erreur de recuperation: ${error}`.cyan.bold};
    }
}

     //Delete Societe
  async function deletesociete(idsociete)
  {
      
      try {
          const pool = await connectDB();
          const query = "DELETE FROM Societe where idsociete = @idsociete";
          const result = await pool.request()
          .input('idsociete', sql.UniqueIdentifier,idsociete)
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


