const { DateTime, UniqueIdentifier } = require('mssql');
const db = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');


//upsert departement
   async function upsertdepartement({idsociete,idsite,responsable,codedept,libelle,email,telephone,adresse,createdby,updatedby}) {
    try {
        const iddepartement = uuidv4();

        const query = `
            IF EXISTS (SELECT 1 FROM departement WHERE codedept = @codedept)
            BEGIN
                UPDATE departement
                SET idsociete = @idsociete,
                    idsite = @idsite,
                    responsable = @responsable,
                    libelle = @libelle,
                    email   = @email,
                    telephone = @telephone,
                    adresse = @adresse,
                    updatedby = @updatedby,
                    updatedat = GETDATE()
                OUTPUT INSERTED.*
                WHERE codedept = @codedept
            END
            ELSE
            BEGIN
                INSERT INTO departement (iddepartement,idsociete,idsite,responsable,codedept,libelle,email,telephone,adresse,createdby,createdat)
                OUTPUT INSERTED.*
                VALUES (@iddepartement,@idsociete,@idsite,@responsable,@codedept,@libelle,@email,@telephone,@adresse,@createdby,GETDATE())
            END
        `;

        const pool = await connectDB();
        const result = await pool.request()
            .input("iddepartement", db.sql.UniqueIdentifier, iddepartement)
            .input("idsociete", db.sql.UniqueIdentifier,idsociete)
            .input("idsite", db.sql.NVarChar, idsite)
            .input("responsable", db.sql.UniqueIdentifier,responsable)
            .input("codedept", db.sql.NVarChar,codedept)
            .input("libelle", db.sql.NVarChar,libelle)
            .input("email", db.sql.NVarChar,email)
            .input("telephone", db.sql.NVarChar,telephone)
            .input("adresse", db.sql.NVarChar,adresse)
            .input("createdby", db.sql.NVarChar, createdby)
            .input("updatedby", db.sql.NVarChar, updatedby)
            .query(query);

        return {
            success: true,
            status: 200,
            message: result.rowsAffected[0] === 1
                ? "Departement mise à jour avec succès !"
                : "Departement créé avec succès !",
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
async function getalldepartement(){
    try {
        const pool = await connectDB()
        const query =`SELECT d.*,st.libelle as site,sc.raisonsociale,u.nom,u.prenom
        FROM Departement d
        left join site st on d.idsite = st.idsite
        left join societe sc on d.idsociete = sc.idsociete
        left join utilisateur u on d.responsable = u.idutilisateur`;

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
async function getonedepartement(iddepartement){
    try {
        const pool = await connectDB()
        const query = "SELECT * FROM Departement where iddepartement = @iddepartement";
        const result = await pool.request()
        .input('iddepartement',db.sql.UniqueIdentifier,iddepartement)
        .query(query);

        if(!result){
            return {success:false,status:404,message:"Departement non trouvé"};
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


 //Delete Departement
async function deletedepartement(iddepartement)
{
    
    try {
        const pool = await connectDB()
        const query = "DELETE FROM Departement where iddepartement = @iddepartement";
        const result = await pool.request()
        .input('iddepartement',db.sql.UniqueIdentifier,iddepartement)
        .query(query);
        return {success:true,status:200,message:"Suppression effectuée avec succès!"}
    } catch (error) {
        return {success:false,status:500,message:`Erreur lors de la suppression : ${error}`.cyan.bold}; 
    }
}

module.exports = {
    getalldepartement,
    getonedepartement,
    upsertdepartement,
    deletedepartement
}
