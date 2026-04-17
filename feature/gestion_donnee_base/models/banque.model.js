const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

const plancomptableModel = require('./plancomptable.model');
const plancomptablemodel = new plancomptableModel();

const societeservice = require('../../gestion_organisation/services/societe.service');
const siteservice = require('../../gestion_organisation/services/site.service');
const deviseservice = require('../../gestion_organisation/services/devise.service');
const lasociete = societeservice;
const lesite = siteservice;
const ladevise = deviseservice;

const queryupsert = `
    IF EXISTS (SELECT 1 FROM Banque WHERE codebanque = @codebanque)
    BEGIN
        UPDATE Banque SET libelle = @libelle, numerocompte = @numerocompte,
        iban = @iban, swift = @swift, actif = @actif, solde_initial = @solde_initial
        , solde_actuel = @solde_actuel, idsociete = @idsociete, idsite = @idsite
        , idcompte = @idcompte, iddevise = @iddevise,
        updatedat = @updatedat, updatedby = @updatedby OUTPUT INSERTED.* WHERE codebanque = @codebanque
    END
    ELSE
    BEGIN
        INSERT INTO Banque (idbanque, codebanque, libelle, numerocompte, iban, 
        swift, actif, solde_initial, solde_actuel, idsociete, idsite, idcompte, iddevise,
        createdat, updatedat, createdby, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idbanque, @codebanque, @libelle, @numerocompte, @iban, @swift,
        @actif, @solde_initial, @solde_actuel, @idsociete, @idsite, @idcompte, @iddevise,
        @createdat, @updatedat, @createdby, @updatedby)
    END
`;

const queryInsert = `
        INSERT INTO Banque (idbanque, codebanque, libelle, numerocompte, iban, 
        swift, actif, solde_initial, solde_actuel, idsociete, idsite, idcompte, iddevise,
        createdat, updatedat, createdby, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idbanque, @codebanque, @libelle, @numerocompte, @iban, @swift,
        @actif, @solde_initial, @solde_actuel, @idsociete, @idsite, @idcompte, @iddevise,
        @createdat, @updatedat, @createdby, @updatedby)
        `;

const queryUpdate = `UPDATE Banque SET libelle = @libelle, numerocompte = @numerocompte,
 iban = @iban, swift = @swift, actif = @actif, solde_initial = @solde_initial
 ,solde_actuel = @solde_actuel, idsociete = @idsociete, idsite = @idsite
 ,idcompte = @idcompte, iddevise = @iddevise, updatedat = @updatedat
 ,updatedby = @updatedby OUTPUT INSERTED.* WHERE idbanque = @idbanque
  `;


const query = `
        SELECT b.*,
        c.numcompte AS compte_numcompte,
        c.libelle AS compte_libelle,
        c.actif AS compte_actif,
        d.codedevise AS devise_code,
        d.intitule AS devise_libelle
        FROM Banque AS b
        LEFT JOIN PlanComptable AS c ON b.idcompte = c.idcompte
        JOIN Devise AS d ON b.iddevise = d.iddevise
        ORDER BY codebanque;
    `;


// Model banque
class BanqueModel {
    constructor(idbanque, codebanque, libelle, numerocompte, iban, swift, 
        actif, solde_initial, solde_actuel, idsociete, idsite, idcompte, iddevise,
        createdat, updatedat, createdby, updatedby, compte = null, devise = null)
    {
        this.idbanque = idbanque;
        this.codebanque = codebanque;
        this.libelle = libelle;
        this.numerocompte = numerocompte;
        this.iban = iban;
        this.swift = swift;
        this.actif = actif;
        this.solde_initial = solde_initial;
        this.solde_actuel = solde_actuel;
        this.idsociete = idsociete;
        this.idsite = idsite;
        this.idcompte = idcompte;
        this.iddevise = iddevise;
        this.createdat = createdat;
        this.updatedat = updatedat;
        this.createdby = createdby;
        this.updatedby = updatedby;

        this.compte = compte;
        this.devise = devise;
    }


    // Créer une banque
    async create_banque() {
        const pool = await connectDB();
        try{
            const result = await pool.request()
            .input('idbanque', sql.UniqueIdentifier, this.idbanque)
            .input('codebanque', sql.NVarChar(5), this.codebanque)
            .input('libelle', sql.NVarChar(150), this.libelle)
            .input('numerocompte', sql.NVarChar(30), this.numerocompte)
            .input('iban', sql.NVarChar(50), this.iban)
            .input('swift', sql.NVarChar(50), this.swift)
            .input('actif', sql.Int, this.actif)
            .input('solde_initial', sql.Decimal(18, 2), this.solde_initial)
            .input('solde_actuel', sql.Decimal(18, 2), this.solde_actuel)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('idsite', sql.UniqueIdentifier, this.idsite)
            .input('idcompte', sql.UniqueIdentifier, this.idcompte)
            .input('iddevise', sql.UniqueIdentifier, this.iddevise)
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


    // Rechercher toutes les banques
    async get_allbanques () {
        const pool = await connectDB();
    
        try {
            const result = await pool.request()
            .query(query);

            const natures = result.recordsets[0];

            return { data: natures };
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }


    // Rechercher une banque
    async get_onebanque (idbanque) {
        const pool = await connectDB();
        try {
            const result = await pool.request().input("idbanque", idbanque)
            .query("SELECT * FROM Banque WHERE idbanque = @idbanque");
            const banque = result.recordset[0];
            let societe = null;
            let site = null;
            let compte = null;
            let devise = null;

            if (banque.idsociete && banque.idsite && banque.idcompte && banque.iddevise) {
                societe = await lasociete.getonesociete(banque.idsociete);
                site = await lesite.getonesite(banque.idsite);
                compte = await plancomptablemodel.get_onecompte(banque.idcompte);
                devise = await ladevise.getonedevise(banque.iddevise);
            }
            return {...banque, societe : societe, site : site, compte : compte, devise : devise};
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Met à jour une banque
    async update_banque (idbanque, data) {
        const pool = await connectDB();
        try {
            const check = await pool.request().input('codebanque', data.codebanque)
            .query(`SELECT COUNT(*) AS count FROM Banque WHERE codebanque = @codebanque`);

            // S'il existe aumoins une ligne, update
            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('idbanque', idbanque)
                    .input('codebanque', sql.NVarChar(5), data.codebanque)
                    .input('libelle', sql.NVarChar(150), data.libelle)
                    .input('numerocompte', sql.NVarChar(30), data.numerocompte)
                    .input('iban', sql.NVarChar(50), data.iban)
                    .input('swift', sql.NVarChar(50), data.swift)
                    .input('actif', sql.Int, data.actif)
                    .input('solde_initial', sql.Decimal(18, 2), data.solde_initial)
                    .input('solde_actuel', sql.Decimal(18, 2), data.solde_actuel)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('idsite', sql.UniqueIdentifier, data.idsite)
                    .input('idcompte', sql.UniqueIdentifier, data.idcompte)
                    .input('iddevise', sql.UniqueIdentifier, data.iddevise)
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(50), data.updatedby)
                    .query(queryUpdate);
                return result;
            } else {
                // Sinon insert
                const result = await pool.request()
                    .input('idbanque', sql.UniqueIdentifier, uuidv4())
                    .input('codebanque', sql.NVarChar(5), data.codebanque)
                    .input('libelle', sql.NVarChar(150), data.libelle)
                    .input('numerocompte', sql.NVarChar(30), data.numerocompte)
                    .input('iban', sql.NVarChar(50), data.iban)
                    .input('swift', sql.NVarChar(50), data.swift)
                    .input('actif', sql.Int, data.actif)
                    .input('solde_initial', sql.Decimal(18, 2), data.solde_initial)
                    .input('solde_actuel', sql.Decimal(18, 2), data.solde_actuel)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('idsite', sql.UniqueIdentifier, data.idsite)
                    .input('idcompte', sql.UniqueIdentifier, data.idcompte)
                    .input('iddevise', sql.UniqueIdentifier, data.iddevise)
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


    // Supprimer une nature d'opération
    async delete_banque(idbanque) {
        const pool = await connectDB();

        // 1. Vérifier si le compte existe
        const check = await pool.request()
            .input("idbanque", sql.UniqueIdentifier, idbanque)
            .query("SELECT idbanque FROM Banque WHERE idbanque = @idbanque");

        if (check.recordset.length === 0) {
            return {
                message: "Banque inexistante."
            };
        }

        // 2. Supprimer le compte
        try {
            await pool.request()
                .input("idbanque", sql.UniqueIdentifier, idbanque)
                .query("DELETE FROM Banque WHERE idbanque = @idbanque");
            return { success: true, message: "Banque supprimée avec succès." };
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
            return {success: false, message: "Erreur de suppression : " + error.message };
        }
    }

    async exportBanques(debut, fin) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('debut', sql.VarChar, debut || null)
            .input('fin', sql.VarChar, fin || null)
            .query(`SELECT b.codebanque, b.libelle, d.codedevise AS devise_code
                ,d.intitule AS devise_libelle, b.numerocompte, b.iban, b.swift
                ,b.solde_initial, b.solde_actuel
                ,c.numcompte, c.libelle AS compte_libelle, b.actif
            FROM Banque AS b
            LEFT JOIN PlanComptable c ON b.idcompte = c.idcompte
            JOIN Devise AS d ON b.iddevise = d.iddevise
            WHERE 
            (@debut IS NULL OR b.codebanque >= @debut) AND
            (@fin IS NULL OR b.codebanque <= @fin)
            ORDER BY b.codebanque`);

        const data = result.recordset;

        return data;
    }
}

module.exports = BanqueModel;
