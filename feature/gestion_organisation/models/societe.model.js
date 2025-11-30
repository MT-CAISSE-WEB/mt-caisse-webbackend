const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
// const { devise } = require('../../gestion_organisation/models/devise.model');

const queryInsert = `
        INSERT INTO Societe (idsociete, code, raisonsociale, rccm, numnui, email, telephone, logo, adresse, suivibudgetaire, createdat, updatedat, createdby, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idsociete, @code, @raisonsociale, @rccm, @numnui, @email, @telephone, @logo, @adresse, @suivibudgetaire, @createdat, @updatedat, @createdby, @updatedby)
        `;

const queryUpdate = `UPDATE Societe SET raisonsociale = @raisonsociale, rccm = @rccm, numnui = @numnui, email = @remail, telephone = @telephone, logo = @logo, adresse = @adresse, suivibudgetaire = @suivibudgetaire, updatedat = @updatedat, updatedby = @updatedby OUTPUT INSERTED.* WHERE code = @code`;

class SocieteModel {
    constructor(idsociete, code, raisonsociale, rccm, numnui, email, 
        telephone, logo, adresse, suivibudgetaire, 
        createdat, updatedat, createdby, updatedby)
    {
        this.idsociete = idsociete;
        this.code = code;
        this.raisonsociale = raisonsociale;
        this.rccm = rccm;
        this.numnui = numnui;
        this.email = email;
        this.telephone = telephone;
        this.logo = logo;
        this.adresse = adresse;
        this.suivibudgetaire = suivibudgetaire;
        this.createdat = createdat;
        this.updatedat = updatedat;
        this.createdby = createdby;
        this.updatedby = updatedby;
    }

    async create_societemodel() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('code', sql.NVarChar(50), this.code)
            .input('raisonsociale', sql.NVarChar(150), this.raisonsociale)
            .input('rccm', sql.NVarChar(50), this.rccm)
            .input('numnui', sql.NVarChar(50), this.numnui)
            .input('email', sql.NVarChar(50), this.email)
            .input('telephone', sql.NVarChar(20), this.telephone)
            .input('logo', sql.NVarChar(150), this.logo)
            .input('adresse', sql.NVarChar(50), this.adresse)
            .input('suivibudgetaire', sql.Int, this.suivibudgetaire)
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

    async get_allsocietes () {
        const pool = await connectDB();
        const query = "SELECT * FROM Societe"
        try {
            const result = await pool.request().query(query);
            return result;
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }


    async get_onesociete(idsociete){
        const pool = await connectDB();
        try {
            const result = await pool.request().input("idsociete", idsociete).query("SELECT * FROM Societe WHERE idsociete = @idsociete");
            const societe = result.recordset[0];
            // // let devisereference = null;
            // // let devisereporting = null;
            // // if (societe.codedevisereference) {
            // //     devisereference = await devise.get_onedevise(societe.codedevisereference);
            // // }
            // // if (societe.codedevisereporting) {
            // //     devisereporting = await devise.get_onedevise(societe.codedevisereporting);
            // // }
            
            return { success: true, data: societe};
            // return {...societe, devisereference : devisereference, devisereporting : devisereporting};
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update_societe (idsociete, data) {
        const pool = await connectDB();
        try {
            const check = await pool.request()
            .input('idsociete', sql.UniqueIdentifier, idsociete)
            .query(`SELECT COUNT(*) AS count FROM Societe WHERE idsociete = @idsociete`);

            // S'il existe update
            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('raisonsociale', sql.NVarChar(150), data.raisonsociale)
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
                    .input('idsociete', sql.UniqueIdentifier, this.idsociete)
                    .input('code', sql.NVarChar(50), this.code)
                    .input('raisonsociale', sql.NVarChar(150), this.raisonsociale)
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

    async delete_societe (idsociete) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idsociete', sql.UniqueIdentifier, idsociete)
            .query("DELETE FROM Axe WHERE idsociete = @idsociete");
            return result;
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
        }
    }
}



module.exports = SocieteModel;