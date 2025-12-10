const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

const centreModel = require('./centreanalytique.model');
const natureModel = require('./natureoperation.model');
const centremodel = new centreModel()
const naturemodel = new natureModel()

const societeservice = require('../../gestion_organisation/services/societe.service');
const siteservice = require('../../gestion_organisation/services/site.service');
const departementservice = require('../../gestion_organisation/services/departement.service');


const queryInsert = `
        INSERT INTO Affectation (idaffectation, codeaffectation, actif, 
        idsociete, idsite, iddepartement, idcentreanalytique, idnature,
        createdat, updatedat, createdby, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idaffectation, @codeaffectation, @actif, 
        @idsociete, @idsite, @iddepartement, @idcentreanalytique, @idnature,
        @createdat, @updatedat, @createdby, @updatedby)
        `;

const queryUpdate = `UPDATE Affectation SET actif = @actif,
        idsociete = @idsociete, idsite = @idsite, iddepartement = @iddepartement,
        idcentreanalytique = @idcentreanalytique, idnature = @idnature,
        updatedat = @updatedat, updatedby = @updatedby 
        OUTPUT INSERTED.* WHERE idaffectation = @idaffectation`;


const query = `
        SELECT A.*,
        so.codesociete AS societe_codesociete, 
        so.raisonsociale AS societe_raisonsociale,
        si.codesite AS site_codesite, 
        si.libelle AS site_libellesite,
        de.codedept AS departement_codedept, 
        de.libelle AS departement_libelledept,
        ca.codecentreanalytique AS centreanalytique_codecentre, 
        ca.libelle AS centreanalytique_libellecentre,
        na.codenature AS natureoperation_codenature, 
        na.libelle AS natureoperation_libellenature 
        FROM Affectation A
        LEFT JOIN Societe so ON A.idsociete = so.idsociete
        LEFT JOIN Site si ON A.idsite = si.idsite
        LEFT JOIN Departement de ON A.iddepartement = de.iddepartement
        LEFT JOIN CentreAnalytique ca ON A.idcentreanalytique = ca.idcentreanalytique
        LEFT JOIN NatureOperation na ON A.idnature = na.idnature
        ORDER BY A.codeaffectation
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY;

        SELECT COUNT(*) AS total FROM Affectation;
    `;

// Model AffectationAnalytique
class AffectationAnalytiqueModel {
    constructor(idaffectation, codeaffectation, actif, idsociete, 
         idsite, iddepartement, idcentreanalytique, idnature,
        createdat, updatedat, createdby, updatedby, 
        societe = null, site = null, departement = null, 
        centre = null, nature = null,)
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

        this.societe = societe;
        this.site = site;
        this.departement = departement;
        this.centre = centre;
        this.nature = nature;
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
    async get_allaffectations (page = 1, limit = 50) {
        const pool = await connectDB();
        const offset = (page - 1) * limit;
                    
        try {
            const result = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .query(query);

            const affectations = result.recordsets[0];
            const total = result.recordsets[1][0].total;
            const totalPages = Math.ceil(total / limit);

            return {page, limit, total, totalPages, data: affectations};
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }


    // Rechercher un AffectationAnalytique
    async get_oneaffectation (idaffectation) {
        const pool = await connectDB();
        try {
            const result = await pool.request().input("idaffectation", idaffectation)
            .query("SELECT * FROM Affectation WHERE idaffectation = @idaffectation");
            const affectation = result.recordset[0];
            let societe = null;
            let site = null;
            let departement = null;
            let centre = null;
            let nature = null;
            if (affectation.idsociete || affectation.idsite || affectation.iddepartement 
                || affectation.idcentreanalytique || affectation.idnature) 
                {
                societe = await societeservice.getonesociete(affectation.idsociete);
                site = await siteservice.getonesite(affectation.idsite);
                departement = await departementservice.getonedepartement(affectation.iddepartement);
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
            .query(`SELECT COUNT(*) AS count FROM Affectation WHERE codeaffectation = @codeaffectation`);

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
            .query("SELECT idaffectation FROM Affectation WHERE idaffectation = @idaffectation");

        if (check.recordset.length === 0) {
            return { message: "Affectation analytique inexistante." };
        }

        // 2. Supprimer le centre
        try {
            await pool.request()
                .input("idaffectation", sql.UniqueIdentifier, idaffectation)
                .query("DELETE FROM Affectation WHERE idaffectation = @idaffectation");
            return { success: true, message: "Affectation analytique supprimée avec succès." };
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
            return {success: false, message: "Erreur de suppression : " + error.message };
        }
    }
}

module.exports = AffectationAnalytiqueModel;