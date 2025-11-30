const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
// const { devise } = require('../../gestion_organisation/models/devise.model');

const queryInsert = `
        INSERT INTO Sites (idsite, codesite, libelle, email, telephone, adresse, idsociete,
        createdat, updatedat, createdby, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idsite, @codesite, @libelle, @email, @telephone, @adresse, @idsociete,
        @createdat, @updatedat, @createdby, @updatedby)
        `;

const queryUpdate = `UPDATE Sites SET libelle = @libelle, email = @email, 
    telephone = @telephone, adresse = @adresse, idsociete = @idsociete,
    updatedat = @updatedat, updatedby = @updatedby OUTPUT INSERTED.* WHERE codesite = @codesite`;

class siteModel {
    constructor(idsite, codesite, libelle, email, telephone, adresse, idsociete,
        createdat, updatedat, createdby, updatedby)
    {
        this.idsite = idsite;
        this.codesite = codesite;
        this.libelle = libelle;
        this.email = email;
        this.telephone = telephone;
        this.adresse = adresse;
        this.idsociete = idsociete;
        this.createdat = createdat;
        this.updatedat = updatedat;
        this.createdby = createdby;
        this.updatedby = updatedby;
    }


    async create_sitemodel() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idsite', sql.UniqueIdentifier, this.idsite)
            .input('codesite', sql.NVarChar(50), this.codesite)
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

    async get_allsites () {
        const pool = await connectDB();
        const query = "SELECT * FROM Sites"
        try {
            const result = await pool.request().query(query);
            return result;
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }


    async get_onesite(idsite){
        const pool = await connectDB();
        try {
            const result = await pool.request().input("idsite", sql.UniqueIdentifier, idsite)
            .query("SELECT * FROM Sites WHERE idsite = @idsite");
            const site = result.recordset[0];
            // // let devisereference = null;
            // // let devisereporting = null;
            // // if (site.codesitedevisereference) {
            // //     devisereference = await devise.get_onedevise(site.codesitedevisereference);
            // // }
            // // if (site.codesitedevisereporting) {
            // //     devisereporting = await devise.get_onedevise(site.codesitedevisereporting);
            // // }
            
            return { success: true, data: site};
            // return {...site, devisereference : devisereference, devisereporting : devisereporting};
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update_site (idsite, data) {
        const pool = await connectDB();
        try {
            const check = await pool.request()
            .input('idsite', sql.UniqueIdentifier, idsite)
            .query(`SELECT COUNT(*) AS count FROM site WHERE idsite = @idsite`);

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
                    .input('idsite', sql.UniqueIdentifier, this.idsite)
                    .input('codesite', sql.NVarChar(50), this.codesite)
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

    async delete_site (idsite) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idsite', sql.UniqueIdentifier, idsite)
            .query("DELETE FROM Axe WHERE idsite = @idsite");
            return result;
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
        }
    }
}



module.exports = siteModel;