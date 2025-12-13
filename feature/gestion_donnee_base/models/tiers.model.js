const { DateTime } = require('mssql');
const {sql, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

const societeservice = require('../../gestion_organisation/services/societe.service');

const getTiers = `

    SELECT 
        t.*,
        so.idsociete AS societe_idsociete,
        so.codesociete AS societe_codesociete,
        so.raisonsociale AS societe_raisonsociale,
        so.rccm AS societe_rccm,
        so.numnui AS societe_numnui,
        so.email AS societe_email,
        so.telephone AS societe_telephone,
        so.adresse AS societe_adresse,
        so.suivibudgetaire AS societe_suivibudgetaire,
        so.createdat AS societe_createdat,
        so.updatedat AS societe_updatedat
    FROM Tiers t
    LEFT JOIN Societe so ON t.idsociete = so.idsociete
    WHERE 
        @search IS NULL OR
        t.codetiers   COLLATE Latin1_General_CI_AI LIKE @search OR
        t.designation COLLATE Latin1_General_CI_AI LIKE @search OR
        t.typetiers   COLLATE Latin1_General_CI_AI LIKE @search;

    SELECT COUNT(*) AS total
    FROM Tiers t
    WHERE 
        @search IS NULL OR
        t.codetiers   COLLATE Latin1_General_CI_AI LIKE @search OR
        t.designation COLLATE Latin1_General_CI_AI LIKE @search OR
        t.typetiers   COLLATE Latin1_General_CI_AI LIKE @search;
`;

const queryInsert = `
        INSERT INTO Tiers (idtiers, codetiers, designation, typetiers, actif, idsociete,
        createdat, updatedat, createdby, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idtiers, @codetiers, @designation, @typetiers, @actif, @idsociete,
        @createdat, @updatedat, @createdby, @updatedby)
    `;

const queryUpdate = `UPDATE Tiers SET designation = @designation, typetiers = @typetiers, 
        actif = @actif, idsociete = @idsociete, updatedat = @updatedat, updatedby = @updatedby 
        OUTPUT INSERTED.* WHERE idtiers = @idtiers`;

const query = `
        SELECT t.*,
            so.idsociete AS societe_idsociete,
            so.codesociete AS societe_codesociete,
            so.raisonsociale AS societe_raisonsociale,
            so.email AS societe_email,
            so.telephone AS societe_telephone,
            so.adresse AS societe_adresse,
            so.createdat AS societe_createdat,
            so.updatedat AS societe_updatedat
        FROM Tiers t
        LEFT JOIN Societe so ON t.idsociete = so.idsociete
        ORDER BY t.codetiers
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY;

        SELECT COUNT(*) AS total FROM Tiers;
    `;


// Model Tiers
class TiersModel {
    constructor(idtiers, codetiers, designation, typetiers, actif, idsociete,
        createdat, updatedat, createdby, updatedby, 
        societe = null)
    {
        this.idtiers = idtiers;
        this.codetiers = codetiers;
        this.designation = designation;
        this.typetiers = typetiers;
        this.actif = actif;
        this.idsociete = idsociete;
        this.createdat = createdat;
        this.updatedat = updatedat;
        this.createdby = createdby;
        this.updatedby = updatedby;
        
        this.societe = societe;
    }


    // Créer un tiers OK
    async create_tiers() {
        const pool = await connectDB();
        try{
            const result = await pool.request()
            .input('idtiers', sql.UniqueIdentifier, this.idtiers)
            .input('codetiers', sql.NVarChar(50), this.codetiers)
            .input('designation', sql.NVarChar(150), this.designation)
            .input('typetiers', sql.NVarChar(50), this.typetiers)
            .input('actif', sql.Int, this.actif)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('createdat', sql.DateTime, this.createdat)
            .input('updatedat', sql.DateTime, this.updatedat)
            .input('createdby', sql.NVarChar(50), this.createdby)
            .input('updatedby', sql.NVarChar(50), this.updatedby)
            .query(queryInsert);

            // console.log(result);

            return { success: true, data: result.recordset[0] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }


    // Rechercher tous les tiers OK
    async get_alltiers (page = 1, limit = 50, search = null) {
        const pool = await connectDB();
        const offset = (page - 1) * limit;

        try {
            const result = await pool.request()
            .input('offset', sql.Int, offset)
            .input('search', sql.NVarChar, search ? `%${search}%` : null)
            .input('limit', sql.Int, limit)
            .query(getTiers);

            const tiers = result.recordsets[0];
            const total = result.recordsets[1][0].total;
            const totalPages = Math.ceil(total / limit);


            return {page, limit, total, totalPages, data: tiers};
        } catch (error) {
            console.log(`Erreur ds de recuperation: ${error}`.cyan.bold);
        }
    }


    // Rechercher un tiers OK
    async get_onetiers(idtiers) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input("idtiers", sql.UniqueIdentifier, idtiers)
                .query("SELECT * FROM Tiers WHERE idtiers = @idtiers");

            const tiers = result.recordset[0];
            let societe = null;

            // Vérifie si un résultat existe
            if (result.recordset.length === 0) 
                { return {success: false, message: "Aucun tiers trouvé avec cet identifiant."}; }
            else
                { 
                    if (tiers.idsociete) {
                        societe = await societeservice.getonesociete(tiers.idsociete); }

                    return { ...tiers, societe : societe };}
                    // return {success: true, data: result.recordset[0]}; }

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    
    // Met à jour un tiers OK
    async update_tiers (idtiers, data) {
        const pool = await connectDB();
        try {
            const check = await pool.request().input('codetiers', data.codetiers)
            .query(`SELECT COUNT(*) AS count FROM Tiers WHERE codetiers = @codetiers`);

            // S'il existe update
            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('idtiers', idtiers)
                    .input('codetiers', sql.NVarChar(50), data.codetiers)
                    .input('designation', sql.NVarChar(150), data.designation)
                    .input('typetiers', sql.NVarChar(50), data.typetiers)
                    .input('actif', sql.Int, data.actif)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(50), data.updatedby)
                    .query(queryUpdate);
                return result;
            } else {
                // Sinon insert
                const result = await pool.request()
                    .input('idtiers', sql.UniqueIdentifier, uuidv4())
                    .input('codetiers', sql.NVarChar(50), data.codetiers)
                    .input('designation', sql.NVarChar(150), data.designation)
                    .input('typetiers', sql.NVarChar(50), data.typetiers)
                    .input('actif', sql.Int, data.actif)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('createdat', sql.DateTime, new Date())
                    .input('createdby', sql.NVarChar(100), data.createdby || "System")
                    .input('updatedat', sql.DateTime, null)
                    .input('updatedby', sql.NVarChar(100), null)
                    .query(queryInsert);
                return result;
            }
        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    // Supprimer un tiers
    async delete_tiers(idtiers) {
        const pool = await connectDB();

        // 1. Vérifier si le tiers existe
        const check = await pool.request()
            .input("idtiers", sql.UniqueIdentifier, idtiers)
            .query("SELECT idtiers FROM Tiers WHERE idtiers = @idtiers");

        if (check.recordset.length === 0) {
            return {
                success: false,
                message: "Aucun tiers trouvé avec cet identifiant."
            };
        }

        // 2. Supprimer le tiers
        try {
            await pool.request()
                .input("idtiers", sql.UniqueIdentifier, idtiers)
                .query("DELETE FROM Tiers WHERE idtiers = @idtiers");
            return { success: true, message: "Tiers supprimé avec succès." };
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
            return {success: false, message: "Erreur de suppression : " + error.message };
        }
    }
}

module.exports = TiersModel;