const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const centreModel = require('./centreanalytique.model');
const natureModel = require('./natureoperation.model');
const societeModel = require('../../gestion_organisation/models/societe.model');
const siteModel = require('../../gestion_organisation/models/site.model');
const departementModel = require('../../gestion_organisation/models/departement.model');

const centremodel = new centreModel()
const naturemodel = new natureModel()
const societemodel = new societeModel()
const sitemodel = new siteModel()
const departementmodel = new departementModel()



const queryInsert = `
        INSERT INTO AffectationAnalytique (idaffectation, codeaffectation, actif, 
        idsociete, idsite, iddepartement, idcentreanalytique, idnature,
        createdat, updatedat, createdby, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idaffectation, @codeaffectation, @actif, 
        @idsociete, @idsite, @iddepartement, @idcentreanalytique, @idnature,
        @createdat, @updatedat, @createdby, @updatedby)
        `;

const queryUpdate = `UPDATE AffectationAnalytique SET actif = @actif,
        idsociete = @idsociete, idsite = @idsite, iddepartement = @iddepartement,
        idcentreanalytique = @idcentreanalytique, idnature = @idnature,
        updatedat = @updatedat, updatedby = @updatedby 
        OUTPUT INSERTED.* WHERE idaffectation = @idaffectation`;

// Model AffectationAnalytique
class AffectationAnalytiqueModel {
    constructor(idaffectation, codeaffectation, actif, idsociete,  idsite, iddepartement, idcentreanalytique, idnature,
        createdat, updatedat, createdby, updatedby)
    {
        this.idaffectation = idaffectation;
        this.codeaffectation = codeaffectation;
        this.actif = actif;
        this.idsociete = idsociete;
        this.idsite = idsite;
        this.iddepartement = iddepartement;
        this.idcentreanalytique = idcentreanalytique;
        this.idnature = idnature;
        this.createdat = createdat;
        this.updatedat = updatedat;
        this.createdby = createdby;
        this.updatedby = updatedby;
    }


    // Créer un compte
    async create_affectation() {
        const pool = await connectDB();
        try{
            const result = await pool.request()
            .input('idaffectation', sql.UniqueIdentifier, this.idaffectation)
            .input('codeaffectation', sql.NVarChar(50), this.codeaffectation)
            .input('actif', sql.Int, this.actif)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('idsite', sql.UniqueIdentifier, this.idsite)
            .input('iddepartement', sql.UniqueIdentifier, this.iddepartement)
            .input('idcentreanalytique', sql.UniqueIdentifier, this.idcentreanalytique)
            .input('idnature', sql.UniqueIdentifier, this.idnature)
            .input('createdat', sql.DateTime, this.createdat)
            .input('updatedat', sql.DateTime, this.updatedat)
            .input('createdby', sql.NVarChar(50), this.createdby)
            .input('updatedby', sql.NVarChar(50), this.updatedby)
            .query(queryInsert);
            return { success: true, data: result.recordset[0] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }


    // Rechercher tous les comptes
    async get_allaffectations () {
        const pool = await connectDB();
        const query = "SELECT * FROM AffectationAnalytique"
        try {
            const result = await pool.request().query(query);
            return result;
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }


    // Rechercher un AffectationAnalytique
    async get_oneaffectation (idaffectation) {
        const pool = await connectDB();
        try {
            const result = await pool.request().input("idaffectation", idaffectation)
            .query("SELECT * FROM AffectationAnalytique WHERE idaffectation = @idaffectation");
            const affectation = result.recordset[0];
            let societe = null;
            let site = null;
            let departement = null;
            let centre = null;
            let nature = null;
            if (affectation.idsociete || affectation.idsite || affectation.iddepartement 
                || affectation.idcentreanalytique || affectation.idnature) 
                {
                societe = await societemodel.get_onesociete(affectation.idsociete);
                site = await sitemodel.get_onesite(affectation.idsite);
                departement = await departementmodel.get_onedepartement(affectation.iddepartement);
                centre = await centremodel.get_onecentre(affectation.idcentreanalytique);
                nature = await naturemodel.get_onenature(affectation.idnature);
            }
            return {...affectation, societe : societe, site : site, departement : departement, centre : centre, nature : nature};
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Met à jour un compte
    async update_affectation (idaffectation, data) {
        const pool = await connectDB();
        try {
            const check = await pool.request()
            .input('codeaffectation', data.codeaffectation)
            .query(`SELECT COUNT(*) AS count FROM AffectationAnalytique WHERE codeaffectation = @codeaffectation`);

            // S'il existe aumoins une ligne, update
            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('idaffectation', idaffectation)
                    .input('codeaffectation', sql.NVarChar(50), data.codeaffectation)
                    .input('actif', sql.Int, data.actif)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('idsite', sql.UniqueIdentifier, data.idsite)
                    .input('iddepartement', sql.UniqueIdentifier, data.iddepartement)
                    .input('idcentreanalytique', sql.UniqueIdentifier, data.idcentreanalytique)
                    .input('idnature', sql.UniqueIdentifier, data.idnature)
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(50), data.updatedby)
                    .query(queryUpdate);
                return result;
            } else {
                // Sinon insert
                const result = await pool.request()
                    .input('idaffectation', sql.UniqueIdentifier, uuidv4())
                    .input('codeaffectation', sql.NVarChar(50), data.codeaffectation)
                    .input('actif', sql.Int, data.actif)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('idsite', sql.UniqueIdentifier, data.idsite)
                    .input('iddepartement', sql.UniqueIdentifier, data.iddepartement)
                    .input('idcentreanalytique', sql.UniqueIdentifier, data.idcentreanalytique)
                    .input('idnature', sql.UniqueIdentifier, data.idnature)
                    .input('createdat', sql.DateTime, new Date())
                    .input('updatedat', sql.DateTime, null)
                    .input('createdby', sql.NVarChar(50), data.createdby)
                    .input('updatedby', sql.NVarChar(50), null)
                    .query(queryInsert);    
                return result;
            }
        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    // Supprimer un AffectationAnalytique
    async delete_affectation(idaffectation) {
        const pool = await connectDB();

        // 1. Vérifier si le centre existe
        const check = await pool.request()
            .input("idaffectation", sql.UniqueIdentifier, idaffectation)
            .query("SELECT idaffectation FROM AffectationAnalytique WHERE idaffectation = @idaffectation");

        if (check.recordset.length === 0) {
            return { message: "Affectation analytique inexistante." };
        }

        // 2. Supprimer le centre
        try {
            await pool.request()
                .input("idaffectation", sql.UniqueIdentifier, idaffectation)
                .query("DELETE FROM AffectationAnalytique WHERE idaffectation = @idaffectation");
            return { success: true, message: "Affectation analytique supprimée avec succès." };
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
            return {success: false, message: "Erreur de suppression : " + error.message };
        }
    }
}

module.exports = AffectationAnalytiqueModel;