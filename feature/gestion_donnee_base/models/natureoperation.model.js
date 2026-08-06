const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
// const societeModel = require('../../gestion_organisation/models/societe.model');
// const societemodel = new societeModel()
const plancomptableModel = require('./plancomptable.model');
const plancomptablemodel = new plancomptableModel();


const societeservice = require('../../gestion_organisation/services/societe.service');
const lasociete = societeservice;


const queryupsert = `
    IF EXISTS (SELECT 1 FROM NatureOperation WHERE codenature = @codenature)
    BEGIN
        UPDATE NatureOperation SET libelle = @libelle, typeoperation = @typeoperation,
        decajustifier = @decajustifier, imputationtiers = @imputationtiers, typetiers = @typetiers,
        actif = @actif, demandedecaissement = @demandedecaissement, 
        idsociete = @idsociete, idcompte = @idcompte, 
        updatedat = @updatedat, updatedby = @updatedby OUTPUT INSERTED.* WHERE codenature = @codenature
    END
    ELSE
    BEGIN
        INSERT INTO NatureOperation (idnature, codenature, libelle, typeoperation, decajustifier, 
        imputationtiers, typetiers, actif, demandedecaissement, idsociete, idcompte,
        createdat, createdby)
        OUTPUT INSERTED.*
        VALUES (@idnature, @codenature, @libelle, @typeoperation, @decajustifier, @imputationtiers,
        @typetiers, @actif, @demandedecaissement, @idsociete, @idcompte,
        @createdat, @createdby)
    END
`;

const queryInsert = `
        INSERT INTO NatureOperation (idnature, codenature, libelle, typeoperation, decajustifier, 
        imputationtiers, typetiers, actif, demandedecaissement, idsociete, idcompte,
        createdat, createdby)
        OUTPUT INSERTED.*
        VALUES (@idnature, @codenature, @libelle, @typeoperation, @decajustifier, @imputationtiers,
        @typetiers, @actif, @demandedecaissement, @idsociete, @idcompte,
        @createdat, @createdby)
        `;

const queryUpdate = `UPDATE NatureOperation SET libelle = @libelle, typeoperation = @typeoperation,
 decajustifier = @decajustifier, imputationtiers = @imputationtiers,
  typetiers = @typetiers, actif = @actif, demandedecaissement = @demandedecaissement, 
  idsociete = @idsociete, idcompte = @idcompte, 
  updatedat = @updatedat, updatedby = @updatedby OUTPUT INSERTED.* WHERE idnature = @idnature
  `;


const query = `
        SELECT n.*,
        c.numcompte AS compte_numcompte,
        c.libelle AS compte_libelle,
        c.ventillable AS compte_ventillable,
        c.auxiliaire AS compte_auxiliaire,
        c.actif AS compte_actif,
        c.suivibudgetaire AS compte_suivibudgetaire,
        c.suivibudgetairemensuel AS compte_suivibudgetairemensuel
        FROM NatureOperation AS n
        LEFT JOIN PlanComptable c ON n.idcompte = c.idcompte
        ORDER BY codenature;
    `;


// Model natureoperation
class NatureOperationModel {
    constructor(idnature, codenature, libelle, typeoperation, decajustifier, imputationtiers, 
        typetiers, actif, demandedecaissement, idsociete, idcompte,
        createdat, updatedat, createdby, updatedby, compte = null)
    {
        this.idnature = idnature;
        this.codenature = codenature;
        this.libelle = libelle;
        this.typeoperation = typeoperation;
        this.decajustifier = decajustifier;
        this.imputationtiers = imputationtiers;
        this.typetiers = typetiers;
        this.actif = actif;
        this.demandedecaissement = demandedecaissement;
        this.idsociete = idsociete;
        this.idcompte = idcompte;
        this.createdat = createdat;
        this.updatedat = updatedat;
        this.createdby = createdby;
        this.updatedby = updatedby;

        this.compte = compte;
    }


    // Créer un compte
    async create_nature() {
        const pool = await connectDB();
        try{
            const result = await pool.request()
            .input('idnature', sql.UniqueIdentifier, this.idnature)
            .input('codenature', sql.NVarChar(50), this.codenature)
            .input('libelle', sql.NVarChar(150), this.libelle)
            .input('typeoperation', sql.NVarChar(50), this.typeoperation)
            .input('decajustifier', sql.Int, this.decajustifier)
            .input('imputationtiers', sql.Int, this.imputationtiers)
            .input('typetiers', sql.NVarChar(50), this.typetiers)
            .input('actif', sql.Int, this.actif)
            .input('demandedecaissement', sql.Int, this.demandedecaissement)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('idcompte', sql.UniqueIdentifier, this.idcompte)
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


    // Rechercher toutes les natures d'opération
    async get_allnatures () {
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


    // Rechercher un natureoperation
    async get_onenature (idnature) {
        const pool = await connectDB();
        try {
            const result = await pool.request().input("idnature", idnature).query("SELECT * FROM NatureOperation WHERE idnature = @idnature");
            const nature = result.recordset[0];
            let societe = null;
            let compte = null;
            if (nature.idsociete && nature.idcompte) {
                societe = await lasociete.getonesociete(nature.idsociete);
                compte = await plancomptablemodel.get_onecompte(nature.idcompte);
            }
            return {...nature, societe : societe, compte : compte};
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Met à jour un compte
    async update_nature (idnature, data) {
        const pool = await connectDB();
        try {
            const check = await pool.request().input('codenature', data.codenature)
            .query(`SELECT COUNT(*) AS count FROM NatureOperation WHERE codenature = @codenature`);

            // S'il existe aumoins une ligne, update
            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('idnature', idnature)
                    .input('codenature', sql.NVarChar(50), data.codenature)
                    .input('libelle', sql.NVarChar(150), data.libelle)
                    .input('typeoperation', sql.NVarChar(50), data.typeoperation)
                    .input('decajustifier', sql.Int, data.decajustifier)
                    .input('imputationtiers', sql.Int, data.imputationtiers)
                    .input('typetiers', sql.NVarChar(50), data.typetiers)
                    .input('actif', sql.Int, data.actif)
                    .input('demandedecaissement', sql.Int, data.demandedecaissement)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('idcompte', sql.UniqueIdentifier, data.idcompte)
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(50), data.updatedby)
                    .query(queryUpdate);
                return result;
            } else {
                // Sinon insert
                const result = await pool.request()
                    .input('idnature', sql.UniqueIdentifier, uuidv4())
                    .input('codenature', sql.NVarChar(50), data.codenature)
                    .input('libelle', sql.NVarChar(150), data.libelle)
                    .input('typeoperation', sql.NVarChar(50), data.typeoperation)
                    .input('decajustifier', sql.Int, data.decajustifier)
                    .input('imputationtiers', sql.Int, data.imputationtiers)
                    .input('typetiers', sql.NVarChar(50), data.typetiers)
                    .input('actif', sql.Int, data.actif)
                    .input('demandedecaissement', sql.Int, data.demandedecaissement)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('idcompte', sql.UniqueIdentifier, data.idcompte)
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
    async delete_nature(idnature) {
        const pool = await connectDB();

        // 1. Vérifier si le compte existe
        const check = await pool.request()
            .input("idnature", sql.UniqueIdentifier, idnature)
            .query("SELECT idnature FROM NatureOperation WHERE idnature = @idnature");

        if (check.recordset.length === 0) {
            return {
                message: "Nature inexistante."
            };
        }

        // 2. Supprimer le compte
        try {
            await pool.request()
                .input("idnature", sql.UniqueIdentifier, idnature)
                .query("DELETE FROM NatureOperation WHERE idnature = @idnature");
            return { success: true, message: "Nature supprimée avec succès." };
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
            return {success: false, message: "Erreur de suppression : " + error.message };
        }
    }

    async getIdCompteByNumero(numcompte) {
        const pool = await connectDB();

        const result = await pool.request()
            .input('numcompte', sql.NVarChar(50), numcompte)
            .query(`
            SELECT idcompte 
            FROM PlanComptable 
            WHERE numcompte = @numcompte
            `);
        return result.recordset[0]?.idcompte || null;
    }


    async exportNatures(debut, fin) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('debut', sql.VarChar, debut || null)
            .input('fin', sql.VarChar, fin || null)
            .query(`SELECT n.codenature, n.libelle, n.typeoperation, n.decajustifier, n.imputationtiers, 
            n.typetiers, n.demandedecaissement, c.numcompte, c.libelle AS compte_libelle, n.actif
            FROM NatureOperation AS n
            LEFT JOIN PlanComptable c ON n.idcompte = c.idcompte
            WHERE 
            (@debut IS NULL OR n.codenature >= @debut) AND
            (@fin IS NULL OR n.codenature <= @fin)
            ORDER BY n.codenature`);

        const data = result.recordset;

        return data;
    }
}

module.exports = NatureOperationModel;
