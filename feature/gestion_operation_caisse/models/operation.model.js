const { DateTime } = require('mssql');
const { sql, connectInstance, connectDB } = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const caissemodel = require('./caisse.model');
const operationmodel = require('./operation.model');
const { operationQueries, typeoperationQueries } = require('../queries/queryIndex');

const queryUpdate = `UPDATE TypeOperation SET codetypeoperation = @codetypeoperation, idoperation = @idoperation, codeoperation = @codeoperation, idsociete = @idsociete, codesociete = @codesociete, idsite = @idsite, codesite = @codesite, idcaisse = @idcaisse, codecaisse = @codecaisse, montant = @montant, updatedat = @updatedat, updatedby = @updatedby OUTPUT INSERTED.* WHERE codetypeoperation = @codetypeoperation`;

class typeoperationModel {
    constructor(idtypeoperation, codetypeoperation, idoperation, idperiode, idsociete, idsite, idcaisse, montant, taux, montantref, createdat, createdby, updatedat, updatedby) {
        this.idtypeoperation = idtypeoperation;
        this.codetypeoperation = codetypeoperation;
        this.idoperation = idoperation;
        this.idperiode = idperiode;
        this.idsociete = idsociete;
        this.idsite = idsite;
        this.idcaisse = idcaisse;
        this.montant = montant;
        this.taux = taux;
        this.montantref = montantref;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;
    }

    async create_typeoperationmodel() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idtypeoperation', sql.UniqueIdentifier, this.idtypeoperation)
                .input('codtypeoperation', sql.NVarChar(24), this.codetypeoperation)
                .input('idoperation', sql.UniqueIdentifier, this.idoperation)
                .input('idperiode', sql.UniqueIdentifier, this.idperiode)
                .input('idsociete', sql.UniqueIdentifier, this.idsociete)
                .input('idsite', sql.UniqueIdentifier, this.idsite)
                .input('idcaisse', sql.UniqueIdentifier, this.idcaisse)
                .input('montant', sql.Decimal(21, 9), this.montant)
                .input('taux', sql.Decimal(21, 9), this.taux)
                .input('montantref', sql.Decimal(21, 9), this.montantref)
                .input('createdat', sql.DateTime, this.createdat)
                .input('createdby', sql.NVarChar(100), this.createdby)
                .input('updatedat', sql.DateTime, this.updatedat)
                .input('updatedby', sql.NVarChar(100), this.updatedby)
                .query(typeoperationQueries.insert);

            return { success: true, data: result.recordset[0] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_alltypeoperations({ page = 1, limit, search = null, date = null, typepaiement = null, devise = null }, user) {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 5;

        const pool = await connectDB();
        const offset = (page - 1) * limit;

        try {
            const result = await pool.request()
                .input('idsite', sql.UniqueIdentifier, user.idsite)
                .input('typeentitesociete', sql.Int, user.typeentitesociete)
                .input('search', sql.NVarChar, search ? `%${search}%` : null)
                .input('date', sql.Date, date || null)
                .input('offset', sql.Int, offset)
                .input('limit', sql.Int, limit)
                .input('typepaiement', sql.NVarChar, typepaiement || null)
                .input('devise', sql.UniqueIdentifier, devise || null)
                .query(operationQueries.getAllOps);

            const operations = result.recordsets[0];
            const total = result.recordsets[1][0].total;
            const totalPages = Math.ceil(total / limit);

            return { page, limit, total, totalPages, data: operations };
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }

    async get_onetypeoperation(idtypeoperation) {
        const pool = await connectDB();
        try {
            const result = await pool.request().input("idtypeoperation", idtypeoperation).query(typeoperationQueries.getById);
            const typeoperation = result.recordset[0];
            let caisse = null;
            let societe = null;
            let site = null;
            let operation = null;

            if (typeoperation.idoperation) {
                operation = await operationmodel.get_onetypeoperation(typeoperation.idoperation);
            }
            if (typeoperation.idcaisse) {
                caisse = await caissemodel.get_onecaisse(typeoperation.idcaisse);
            }
            return { ...typeoperation, societe: societe, site: site, caisse: caisse, operation: operation };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update_typeoperation(idtypeoperation, data) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idtypeoperation', sql.UniqueIdentifier, idtypeoperation)
                .input('codtypeoperation', sql.NVarChar(24), data.codetypeoperation)
                .input('idoperation', sql.UniqueIdentifier, data.idoperation)
                .input('idcaisse', sql.UniqueIdentifier, data.idcaisse)
                .input('montant', sql.Decimal(21, 9), data.montant)
                .input('taux', sql.Decimal(21, 9), data.taux)
                .input('montantref', sql.Decimal(21, 9), data.montantref)
                .input('updatedat', sql.DateTime, new Date())
                .input('updatedby', sql.NVarChar(100), data.updatedby)
                .query(typeoperationQueries.update);
            return result;
        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    async delete_typeoperation(idtypeoperation) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idtypeoperation', sql.UniqueIdentifier, idtypeoperation)
                .query(typeoperationQueries.delete);
            return result;
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
        }
    }

    async get_soldecaisse() {
        const pool = await connectDB();
        try {
            const result = await pool.request().query(typeoperationQueries.solde_calcul);
            return result.recordset;
        } catch (error) {
            console.log(`Erreur de récupération du solde caisse: ${error}`.cyan.bold);
        }
    }

    async get_soldeperiode(idperiode) {
        const pool = await connectDB();
        try {
            const result = await pool.request().input("idperiode", idperiode).query(typeoperationQueries.solde_caisse_periode);
            console.log("resultat solde periode ", result);
            return result.recordset;
        } catch (error) {
            console.log(`Erreur de récupération du solde par période: ${error}`.cyan.bold);
        }
    }

    async get_operationmax() {
        const pool = await connectDB();
        try {
            const result = await pool.request().query(typeoperationQueries.operation);
            return result.recordset;
        } catch (error) {
            console.log(`Erreur de récupération des opérations: ${error}`.cyan.bold);
            throw new Error(error);
        }
    }

    async get_dataReçuPdf(idoperation) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idoperation', sql.UniqueIdentifier, idoperation)
                .query(typeoperationQueries.reçucaisse);
            return result.recordset;
        } catch (error) {
            console.log(`Erreur de récupération du reçu: ${error}`.cyan.bold);
            throw new Error(error);
        }
    }

    /**
   * Récupère une opération par son code (ex: "OPE-2026-001")
   * @param {string} codeoperation - Code unique de l'opération
   * @returns {Promise<object>} - Objet { idoperation, ... }
   */
    async get_by_codeoperation(codeoperation) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('codeoperation', sql.NVarChar(50), codeoperation)
                .query(typeoperationQueries.getByCodeOperation);
            return result.recordset[0] || null; // Retourne null si non trouvé
        } catch (error) {
            console.error(`[OperationModel] Erreur get_by_codeoperation: ${error.message}`);
            throw new Error(`Échec de la récupération de l'opération: ${error.message}`);
        }
    }

    async getValidateursByOperation(idoperation) {
        const pool = await connectDB();

        try {
            const result = await pool.request()
                .input("idoperation", sql.UniqueIdentifier, idoperation)
                .query(typeoperationQueries.validateurOp);

            return result.recordset;
        } catch (error) {
            console.log(`Erreur de récupération du reçu: ${error}`.cyan.bold);
            throw new Error(error);
        }
    }

    async get_dataOperationJustif(idoperation) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idoperation', sql.UniqueIdentifier, idoperation)
                .query(typeoperationQueries.operationJustificatif);
            return result.recordset;
        } catch (error) {
            console.log(`Erreur de récupération du reçu: ${error}`.cyan.bold);
            throw new Error(error);
        }
    }

    async get_dataDetailJustif(idoperation) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idoperation', sql.UniqueIdentifier, idoperation)
                .query(typeoperationQueries.detailsJustificatif);
            return result.recordset;
        } catch (error) {
            console.log(`Erreur de récupération du reçu: ${error}`.cyan.bold);
            throw new Error(error);
        }
    }

    async get_dataOpEncaissement(idoperation) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idoperation', sql.UniqueIdentifier, idoperation)
                .query(typeoperationQueries.encaissementJustif);
            return result.recordset;
        } catch (error) {
            console.log(`Erreur de récupération du reçu: ${error}`.cyan.bold);
            throw new Error(error);
        }
    }

    async get_dataDecInit(idoperation) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idoperation', sql.UniqueIdentifier, idoperation)
                .query(typeoperationQueries.decaissementInit);
            return result.recordset;
        } catch (error) {
            console.log(`Erreur de récupération du reçu: ${error}`.cyan.bold);
            throw new Error(error);
        }
    }

}



module.exports = typeoperationModel;
