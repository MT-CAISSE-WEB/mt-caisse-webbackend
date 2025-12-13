const { DateTime } = require('mssql');
const {sql, connectInstance, connectionDb} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

const queryInsert = `
        INSERT INTO Societe (idsociete,codedevisereference, codedevisereporting, code, raisonsociale, rccm, numNUI, email, telephone, logo, adresse, suivibudgetaire, createdAt, updatedAt, createdBy, updatedBy)
        OUTPUT INSERTED.*
        VALUES (@idsociete, @code, @codedevisereference, @codedevisereporting, @raisonsociale, @rccm, @numNUI, @email, @telephone, @logo, @adresse, @suivibudgetaire, @createdAt, @updatedAt, @createdBy, @updatedBy)
        `;

const queryUpdate = `UPDATE Societe SET raisonsociale = @raisonsociale, codedevisereference = @codedevisereference, codedevisereporting = @codedevisereporting, rccm = @rccm, numNUI = @numNUI, email = @remail, telephone = @telephone, logo = @logo, adresse = @adresse, suivibudgetaire = @suivibudgetaire, updatedAt = @updatedAt, updatedBy = @updatedBy OUTPUT INSERTED.* WHERE code = @code`;

class societeModel {
    constructor(idsociete, code, raisonsociale, rccm, numNUI, email, telephone, logo, adresse, suivibudgetaire, 
        createdAt, updatedAt, createdBy, updatedBy)
    {
        this.idsociete = idsociete;
        this.code = code;
        this.raisonsociale = raisonsociale;
        this.rccm = rccm;
        this.numNUI = numNUI;
        this.email = email;
        this.telephone = telephone;
        this.logo = logo;
        this.adresse = adresse;
        this.suivibudgetaire = suivibudgetaire;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }

    async create_societemodel() {
        const pool = await connectionDb();
        try {
            const result = await pool.request()
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('code', sql.NVarChar(50), this.code)
            .input('codedevisereference', sql.UniqueIdentifier, this.codedevisereference)
            .input('codedevisereporting', sql.UniqueIdentifier, this.codedevisereporting)
            .input('raisonsociale', sql.NVarChar(150), this.raisonsociale)
            .input('rccm', sql.NVarChar(50), this.rccm)
            .input('numNUI', sql.NVarChar(50), this.numNUI)
            .input('email', sql.NVarChar(50), this.email)
            .input('telephone', sql.NVarChar(20), this.telephone)
            .input('logo', sql.NVarChar(150), this.logo)
            .input('adresse', sql.NVarChar(50), this.adresse)
            .input('suivibudgetaire', sql.Int, this.suivibudgetaire)
            .input('createdAt', sql.DateTime, this.createdAt)
            .input('createdBy', sql.NVarChar(100), this.createdBy)
            .input('updatedAt', sql.DateTime, this.updatedAt)
            .input('updatedBy', sql.NVarChar(100), this.updatedBy)
            .query(queryInsert);
            
            return { success: true, data: result.recordset[0] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_allsocietes () {
        const pool = await connectionDb();
        const query = "SELECT * FROM Societe"
        try {
            const result = await pool.request().query(query);
            return result;
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }

    async get_onesociete(idsociete){
        const pool = await connectionDb();
        try {
            const result = await pool.request().input("idsociete", idsociete).query("SELECT * FROM Societe WHERE idsociete = @idsociete");
            const societe = result.recordset[0];
            let devisereference = null;
            let devisereporting = null;
            if (societe.codedevisereference) {
                devisereference = await devise.get_onedevise(societe.codedevisereference);
            }
            if (societe.codedevisereporting) {
                devisereporting = await devise.get_onedevise(societe.codedevisereporting);
            }
            
            return {...societe, devisereference : devisereference, devisereporting : devisereporting};
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update_societe (code, data) {
        const pool = await connectionDb();
        try {
            const check = await pool.request()
            .input('code', sql.NVarChar(50), code)
            .query(`SELECT COUNT(*) AS count FROM Societe WHERE code = @code`);

            // S'il existe update
            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('code', sql.NVarChar(50), data.code)
                    .input('codedevisereference', sql.UniqueIdentifier, data.codedevisereference)
                    .input('codedevisereporting', sql.UniqueIdentifier, data.codedevisereporting)
                    .input('raisonsociale', sql.NVarChar(150), data.raisonsociale)
                    .input('rccm', sql.NVarChar(50), data.rccm)
                    .input('numNUI', sql.NVarChar(50), data.numNUI)
                    .input('email', sql.NVarChar(50), data.email)
                    .input('telephone', sql.NVarChar(20), data.telephone)
                    .input('logo', sql.NVarChar(150), data.logo)
                    .input('adresse', sql.NVarChar(50), data.adresse)
                    .input('suivibudgetaire', sql.Int, data.suivibudgetaire)
                    .input('updatedAt', sql.DateTime, new Date())
                    .input('updatedBy', sql.NVarChar(100), data.updatedBy)
                    .query(queryUpdate);
                return result;
            } else {
                // 3️ Sinon → INSERT
                const result = await pool.request()
                    .input('idsociete', sql.UniqueIdentifier, uuidv4())
                    .input('code', sql.NVarChar(50), this.code)
                    .input('codedevisereference', sql.UniqueIdentifier, this.codedevisereference)
                    .input('codedevisereporting', sql.UniqueIdentifier, this.codedevisereporting)
                    .input('raisonsociale', sql.NVarChar(150), this.raisonsociale)
                    .input('rccm', sql.NVarChar(50), this.rccm)
                    .input('numNUI', sql.NVarChar(50), this.numNUI)
                    .input('email', sql.NVarChar(50), this.email)
                    .input('telephone', sql.NVarChar(20), this.telephone)
                    .input('logo', sql.NVarChar(150), this.logo)
                    .input('adresse', sql.NVarChar(50), this.adresse)
                    .input('suivibudgetaire', sql.Int, this.suivibudgetaire)
                    .input('createdAt', sql.DateTime, new Date())
                    .input('createdBy', sql.NVarChar(100), data.createdBy)
                    .input('updatedAt', sql.DateTime, new Date())
                    .input('updatedBy', sql.NVarChar(100), data.updatedBy)
                    .query(queryInsert);
                return result;
            }
        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    async delete_societe (idsociete) {
        const pool = await connectionDb();
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



module.exports = societeModel;