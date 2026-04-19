const { DateTime } = require('mssql');
const {sql, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');


const societeservice = require('../../gestion_organisation/services/societe.service');

const lasociete = societeservice;

const queryInsert = `
        INSERT INTO PlanComptable (idcompte, numcompte, libelle, ventillable,
        auxiliaire, actif, suivibudgetaire, suivibudgetairemensuel, idsociete,
        createdat, updatedat, createdby, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idcompte, @numcompte, @libelle, @ventillable, @auxiliaire, 
        @actif, @suivibudgetaire, @suivibudgetairemensuel, @idsociete,
        @createdat, @updatedat, @createdby, @updatedby)
        `;

const queryupsert = `
    IF EXISTS (SELECT 1 FROM PlanComptable WHERE numcompte = @numcompte)
    BEGIN
        UPDATE PlanComptable SET libelle = @libelle, 
        ventillable = @ventillable, auxiliaire = @auxiliaire, actif = @actif, 
        suivibudgetaire = @suivibudgetaire, suivibudgetairemensuel = @suivibudgetairemensuel, 
        idsociete = @idsociete, updatedat = @updatedat, updatedby = @updatedby 
        OUTPUT INSERTED.*
        WHERE numcompte = @numcompte
    END
    ELSE
    BEGIN
        INSERT INTO PlanComptable (idcompte, numcompte, libelle, ventillable,
        auxiliaire, actif, suivibudgetaire, suivibudgetairemensuel, idsociete,
        createdat, updatedat, createdby, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idcompte, @numcompte, @libelle, @ventillable, @auxiliaire, 
        @actif, @suivibudgetaire, @suivibudgetairemensuel, @idsociete,
        @createdat, @updatedat, @createdby, @updatedby)
    END
    `;


const queryUpdate = `UPDATE PlanComptable SET libelle = @libelle, 
ventillable = @ventillable, auxiliaire = @auxiliaire, actif = @actif, 
suivibudgetaire = @suivibudgetaire, suivibudgetairemensuel = @suivibudgetairemensuel, 
idsociete = @idsociete, updatedat = @updatedat, updatedby = @updatedby 
OUTPUT INSERTED.* WHERE idcompte = @idcompte`;

const query = `
        SELECT c.*,
            so.idsociete AS societe_idsociete,
            so.codesociete AS societe_codesociete,
            so.raisonsociale AS societe_raisonsociale,
            so.email AS societe_email,
            so.telephone AS societe_telephone,
            so.adresse AS societe_adresse,
            so.createdat AS societe_createdat,
            so.updatedat AS societe_updatedat
        FROM PlanComptable c
        LEFT JOIN Societe so ON c.idsociete = so.idsociete
        ORDER BY c.numcompte ASC;
    `;

// Model plancomptable
class PlanComptableModel {
    constructor(idcompte, numcompte, libelle, ventillable, auxiliaire, actif, 
        suivibudgetaire, suivibudgetairemensuel, idsociete,
        createdat, updatedat, createdby, updatedby)
    {
        this.idcompte = idcompte;
        this.numcompte = numcompte;
        this.libelle = libelle;
        this.ventillable = ventillable;
        this.auxiliaire = auxiliaire;
        this.actif = actif;
        this.suivibudgetaire = suivibudgetaire;
        this.suivibudgetairemensuel = suivibudgetairemensuel;
        this.idsociete = idsociete;
        this.createdat = createdat;
        this.updatedat = updatedat;
        this.createdby = createdby;
        this.updatedby = updatedby;
    }


    // Créer un compte OK
    async create_compte() {
        const pool = await connectDB();
        try{
            const result = await pool.request()
            .input('idcompte', sql.UniqueIdentifier, this.idcompte)
            .input('numcompte', sql.NVarChar(50), this.numcompte)
            .input('libelle', sql.NVarChar(150), this.libelle)
            .input('ventillable', sql.Int, this.ventillable)
            .input('auxiliaire', sql.Int, this.auxiliaire)
            .input('actif', sql.Int, this.actif)
            .input('suivibudgetaire', sql.Int, this.suivibudgetaire)
            .input('suivibudgetairemensuel', sql.Int, this.suivibudgetairemensuel)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('createdat', sql.DateTime, this.createdat)
            .input('updatedat', sql.DateTime, this.updatedat)
            .input('createdby', sql.NVarChar(50), this.createdby)
            .input('updatedby', sql.NVarChar(50), this.updatedby)
            .query(queryupsert);

            return { success: true, data: result.recordset[0] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }


    // Rechercher tous les comptes OK
    async get_allcomptes () {

        const pool = await connectDB();
        try {
            
            const result = await pool.request()
            .query(query);

            const comptes = result.recordsets[0];

            return {success: true, data: comptes};
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }


    // Rechercher un compte par id OK
    async get_onecompte(idcompte) {
    const pool = await connectDB();
    try {
        const result = await pool.request()
            .input("idcompte", sql.UniqueIdentifier, idcompte)
            .query("SELECT * FROM PlanComptable WHERE idcompte = @idcompte");

        const compte = result.recordset[0];
        let societe = null;

        if (compte.idsociete) {
            societe = await lasociete.getonesociete(compte.idsociete);
        }

        return { ...compte, societe : societe };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

    // Met à jour un compte
    async update_compte (idcompte, data) {
        const pool = await connectDB();
        try {
            const check = await pool.request().input('numcompte', data.numcompte)
            .query(`SELECT COUNT(*) AS count FROM PlanComptable WHERE numcompte = @numcompte`);

            // S'il existe aumoins une ligne, update
            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('idcompte', idcompte)
                    .input('numcompte', sql.NVarChar(50), data.numcompte)
                    .input('libelle', sql.NVarChar(150), data.libelle)
                    .input('ventillable', sql.Int, data.ventillable)
                    .input('auxiliaire', sql.Int, data.auxiliaire)
                    .input('actif', sql.Int, data.actif)
                    .input('suivibudgetaire', sql.Int, data.suivibudgetaire)
                    .input('suivibudgetairemensuel', sql.Int, data.suivibudgetairemensuel)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(50), data.updatedby)
                    .query(queryUpdate);
                return result;
            } else {
                // Sinon insert
                const result = await pool.request()
                    .input('idcompte', sql.UniqueIdentifier, uuidv4())
                    .input('numcompte', sql.NVarChar(50), data.numcompte)
                    .input('libelle', sql.NVarChar(150), data.libelle)
                    .input('ventillable', sql.Int, data.ventillable)
                    .input('auxiliaire', sql.Int, data.auxiliaire)
                    .input('actif', sql.Int, data.actif)
                    .input('suivibudgetaire', sql.Int, data.suivibudgetaire)
                    .input('suivibudgetairemensuel', sql.Int, data.suivibudgetairemensuel)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('createdat', sql.DateTime, new Date())
                    .input('updatedat', sql.DateTime, null)
                    .input('createdby', sql.NVarChar(50), data.createdby)
                    .input('updatedby', sql.NVarChar(50), data.updatedby)
                    .query(queryInsert);
                return result;
            }
        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    // Supprimer un compte OK
    async delete_compte(idcompte) {
        const pool = await connectDB();

        // 1. Vérifier si le compte existe
        const check = await pool.request()
            .input("idcompte", sql.UniqueIdentifier, idcompte)
            .query("SELECT idcompte FROM PlanComptable WHERE idcompte = @idcompte");

        if (check.recordset.length === 0) {
            return {
                message: "Compte inexistant."
            };
        }

        // 2. Supprimer le compte
        try {
            await pool.request()
                .input("idcompte", sql.UniqueIdentifier, idcompte)
                .query("DELETE FROM PlanComptable WHERE idcompte = @idcompte");
            return { success: true, message: "Compte supprimé avec succès." };
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
            return {success: false, message: "Erreur de suppression : " + error.message };
        }
    }

    async exportComptes(debut, fin) {

        const pool = await connectDB();

        const result = await pool.request()
            .input('debut', sql.VarChar, debut || null)
            .input('fin', sql.VarChar, fin || null)
            .query(`SELECT numcompte, libelle, actif 
            FROM PlanComptable
            WHERE 
                (
                    (@debut IS NULL OR @debut = '' OR numcompte >= @debut)
                AND (@fin IS NULL OR @fin = '' OR numcompte <= @fin)
                )
            ORDER BY numcompte`);

        const data = result.recordset;

        return data;
    }
}

module.exports = PlanComptableModel;