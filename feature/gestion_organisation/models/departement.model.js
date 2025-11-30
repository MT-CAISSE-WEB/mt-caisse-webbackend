const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
// const { devise } = require('../../gestion_organisation/models/devise.model');

const queryInsert = `
        INSERT INTO Departement (iddepartement, codedept, libelle, email, telephone, adresse,
        idsociete, idsite,
        createdat, updatedat, createdby, updatedby)
        OUTPUT INSERTED.*
        VALUES (@iddepartement, @codedept, @libelle, @email, @telephone, @adresse,
        @idsociete, @idsite,
        @createdat, @updatedat, @createdby, @updatedby)
        `;

const queryUpdate = `UPDATE Departement SET libelle = @libelle, email = @email, 
    telephone = @telephone, adresse = @adresse, idsociete = @idsociete, idsite = @idsite,
    updatedat = @updatedat, updatedby = @updatedby OUTPUT INSERTED.* WHERE codedept = @codedept`;

class departementModel {
    constructor(iddepartement, codedept, libelle, email, telephone, adresse, idsociete, idsite,
        createdat, updatedat, createdby, updatedby)
    {
        this.iddepartement = iddepartement;
        this.codedept = codedept;
        this.libelle = libelle;
        this.email = email;
        this.telephone = telephone;
        this.adresse = adresse;
        this.idsociete = idsociete;
        this.idsite = idsite;
        this.createdat = createdat;
        this.updatedat = updatedat;
        this.createdby = createdby;
        this.updatedby = updatedby;
    }


    async create_departementmodel() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('iddepartement', sql.UniqueIdentifier, this.iddepartement)
            .input('codedept', sql.NVarChar(50), this.codedept)
            .input('libelle', sql.NVarChar(150), this.libelle)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('email', sql.NVarChar(50), this.email)
            .input('telephone', sql.NVarChar(20), this.telephone)
            .input('adresse', sql.NVarChar(50), this.adresse)
            .input('createdat', sql.DateTime, this.createdat)
            .input('createdby', sql.NVarChar(100), this.createdby)
            .input('updatedat', sql.DateTime, this.updatedat)
            .input('updatedby', sql.NVarChar(100), this.updatedby)
            .query(queryInsert);
            
            return { success: true, data: result.recordset[0] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_alldepartements () {
        const pool = await connectDB();
        const query = "SELECT * FROM Departement"
        try {
            const result = await pool.request().query(query);
            return result;
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }


    async get_onedepartement(iddepartement){
        const pool = await connectDB();
        try {
            const result = await pool.request().input("iddepartement", sql.UniqueIdentifier, iddepartement)
            .query("SELECT * FROM Departement WHERE iddepartement = @iddepartement");
            const departement = result.recordset[0];
            // // let devisereference = null;
            // // let devisereporting = null;
            // // if (departement.codedeptdevisereference) {
            // //     devisereference = await devise.get_onedevise(departement.codedeptdevisereference);
            // // }
            // // if (departement.codedeptdevisereporting) {
            // //     devisereporting = await devise.get_onedevise(departement.codedeptdevisereporting);
            // // }
            
            return { success: true, data: departement};
            // return {...departement, devisereference : devisereference, devisereporting : devisereporting};
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update_departement (iddepartement, data) {
        const pool = await connectDB();
        try {
            const check = await pool.request()
            .input('iddepartement', sql.UniqueIdentifier, iddepartement)
            .query(`SELECT COUNT(*) AS count FROM departement WHERE iddepartement = @iddepartement`);

            // S'il existe update
            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('libelle', sql.NVarChar(150), data.libelle)
                    .input('rccm', sql.NVarChar(50), data.rccm)
                    .input('numnui', sql.NVarChar(50), data.numnui)
                    .input('email', sql.NVarChar(50), data.email)
                    .input('telephone', sql.NVarChar(20), data.telephone)
                    .input('logo', sql.NVarChar(150), data.logo)
                    .input('adresse', sql.NVarChar(50), data.adresse)
                    .input('suivibudgetaire', sql.Int, data.suivibudgetaire)
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(100), data.updatedby)
                    .query(queryUpdate);
                return result;
            } else {
                // 3️ Sinon → INSERT
                const result = await pool.request()
                    .input('iddepartement', sql.UniqueIdentifier, this.iddepartement)
                    .input('codedept', sql.NVarChar(50), this.codedept)
                    .input('libelle', sql.NVarChar(150), this.libelle)
                    .input('rccm', sql.NVarChar(50), this.rccm)
                    .input('numnui', sql.NVarChar(50), this.numnui)
                    .input('email', sql.NVarChar(50), this.email)
                    .input('telephone', sql.NVarChar(20), this.telephone)
                    .input('logo', sql.NVarChar(150), this.logo)
                    .input('adresse', sql.NVarChar(50), this.adresse)
                    .input('suivibudgetaire', sql.Int, this.suivibudgetaire)
                    .input('createdat', sql.DateTime, new Date())
                    .input('createdby', sql.NVarChar(100), data.createdby)
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(100), data.updatedby)
                    .query(queryInsert);
                return result;
            }
        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    async delete_departement (iddepartement) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('iddepartement', sql.UniqueIdentifier, iddepartement)
            .query("DELETE FROM Axe WHERE iddepartement = @iddepartement");
            return result;
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
        }
    }
}



module.exports = departementModel;