
const { DateTime, UniqueIdentifier } = require('mssql');
const {db, sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

const today = new Date();

const queryinsert = `
        INSERT INTO ligneEcritureComptable (idligneecriture ,idecriture,idcentreanalytique,centreanalytique, idcompte,compte,idtiers,tiers,numligne ,typeecriture,libelle,debit,credit,etat,iddevise,devise,montantdevise,taux,montantbase,createdby,createdat)
        OUTPUT INSERTED.*
        VALUES (@idligneecriture, @idecriture, @idcentreanalytique, @centreanalytique, @idcompte, @compte, @idtiers, @tiers, @numligne, @typeecriture, @libelle, @debit, @credit, @etat, @iddevise, @devise, @montantdevise, @taux, @montantbase, @createdby, @createdat)
        `;

//Create Ecriture
async function createligneEcriture(data){
        try {
            const pool = await connectDB()
            const idligneecriture = uuidv4();
            const result = await pool.request()
            .input('idligneecriture', sql.UniqueIdentifier,idligneecriture)
            .input ('idecriture', sql.UniqueIdentifier,data.idecriture)
            .input ('idcentreanalytique', sql.UniqueIdentifier,data.idcentreanalytique)
            .input ('centreanalytique', sql.NVarChar(50),data.centreanalytique)
            .input ('idcompte', sql.UniqueIdentifier,data.idcompte)
            .input ('compte', sql.NVarChar(50),data.compte)
            .input ('idtiers', sql.UniqueIdentifier,data.idtiers)
            .input ('tiers', sql.NVarChar(50),data.tiers)
            .input ('numligne', sql.Int,data.numligne)
            .input ('typeecriture', sql.NVarChar(50),data.typeecriture)
            .input ('libelle', sql.NVarChar(100),data.libelle)
            .input ('debit', sql.Decimal(18,2),data.debit)
            .input ('credit', sql.Decimal(18,2),data.credit)
            .input ('etat', sql.NVarChar(20),data.etat)
            .input ('iddevise', sql.UniqueIdentifier,data.iddevise)
            .input ('devise', sql.NVarChar(50),data.devise)
            .input ('montantdevise', sql.Decimal(18,2),data.montantdevise)
            .input ('taux', sql.Decimal(18,2),data.taux)
            .input ('montantbase', sql.Decimal(18,2),data.montantbase)
            .input ('createdat', sql.DateTime,today)
            .input ('createdby', sql.NVarChar(50),data.createdby)
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

      // Get all
    async function getallLigneEcriture(){
        try {
            const pool = await connectDB();
            const query = "SELECT * FROM ligneEcritureComptable";
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