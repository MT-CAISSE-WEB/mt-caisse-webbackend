const { DateTime } = require('mssql');
const { sql, connectInstance, connectDB } = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const caisseModel = require('./caisse.model');
const caissemodel = new caisseModel();
const { caisseperiodeQueries } = require('../queries/queryIndex');


class caisseperiodeModel {
    constructor(idperiode, idcaisse, dateperiode, soldeouverture, soldefermeture, montantphysique, ecart, statut, validatedat, validatedby, createdat, createdby, updatedat, updatedby, caisse = null) {
        this.idperiode = idperiode;
        this.idcaisse = idcaisse;
        this.dateperiode = dateperiode;
        this.soldeouverture = soldeouverture;
        this.soldefermeture = soldefermeture;
        this.montantphysique = montantphysique;
        this.ecart = ecart;
        this.statut = statut;
        this.validatedat = validatedat;
        this.validatedby = validatedby;

        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;

        this.caisse = caisse;   // peut être null
    }

    async create_caisseperiode() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idperiode', sql.UniqueIdentifier, this.idperiode)
                .input('idcaisse', sql.UniqueIdentifier, this.idcaisse)
                .input('dateperiode', sql.DateTime, this.dateperiode)
                .input('soldeouverture', sql.Decimal(22, 9), this.soldeouverture)
                .input('soldefermeture', sql.Decimal(22, 9), this.soldefermeture)
                .input('montantphysique', sql.Decimal(22, 9), this.montantphysique)
                .input('ecart', sql.Decimal(22, 9), this.ecart)
                .input('statut', sql.NVarChar(20), this.statut)
                .input('createdat', sql.DateTime, this.createdat)
                .input('createdby', sql.NVarChar(100), this.createdby)
                .query(caisseperiodeQueries.INSERT);

            return { success: true, data: result.recordset[0] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_recentecaisseperiode(idcaisse) {
        const pool = await connectDB();
        try {
            const result = await pool.request().input('idcaisse', sql.UniqueIdentifier, idcaisse).query(caisseperiodeQueries.RECENT_PERIODE);
            const caisseperiode = result.recordset[0];
            let caisse = null;

            if (caisseperiode.idcaisse) {
                caisse = await caissemodel.get_onecaisse(caisseperiode.idcaisse);
            }

            return { ...caisseperiode, caisse: caisse };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_allcaisseperiodes(page = 1, limit = 5) {
        const pool = await connectDB();
        const offset = (page - 1) * limit;
        try {
            const result = await pool.request()
                .input('offset', sql.Int, offset)
                .input('limit', sql.Int, limit)
                .query(caisseperiodeQueries.getAll);

            const caisses = result.recordsets[0];
            const total = result.recordsets[1][0].total;
            const totalPages = Math.ceil(total / limit);

            return { page, limit, total, totalPages, data: caisses };
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }

    async get_onecaisseperiode(idperiode) {
        const pool = await connectDB();
        try {
            const result = await pool.request().input('idperiode', sql.UniqueIdentifier, idperiode).query(caisseperiodeQueries.getById);
            const caisseperiode = result.recordset[0];
            let caisse = null;

            if (caisseperiode.idcaisse) {
                caisse = await caissemodel.get_onecaisse(caisseperiode.idcaisse);
            }

            return { ...caisseperiode, caisse: caisse };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_statutperiode(idcaisse, statut) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idcaisse', sql.UniqueIdentifier, idcaisse)
                .input('statut', sql.NVarChar(10), statut)
                .query(caisseperiodeQueries.GET_STATUT_PERIODE);

            const caisseperiode = result.recordset[0];

            return { success: true, data: caisseperiode };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update_caisseperiode(idperiode, data) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idperiode', sql.UniqueIdentifier, idperiode)
                .input('idcaisse', sql.UniqueIdentifier, data.idcaisse)
                .input('soldeouverture', sql.Decimal(22, 9), data.soldeouverture)
                .input('soldefermeture', sql.Decimal(22, 9), data.soldefermeture)
                .input('montantphysique', sql.Decimal(22, 9), data.montantphysique)
                .input('ecart', sql.Decimal(22, 9), data.ecart)
                .input('statut', sql.NVarChar(10), data.statut)
                .input('updatedAt', sql.DateTime, new Date())
                .input('updatedBy', sql.NVarChar(100), data.updatedby || 'System')
                .query(caisseperiodeQueries.UPDATE);
            return result;
        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    async fermetureorclose_caisseperiode(idperiode, data) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idperiode', sql.UniqueIdentifier, idperiode)
                .input('soldefermeture', sql.Decimal(22, 9), data.soldefermeture)
                .input('montantphysique', sql.Decimal(22, 9), data.montantphysique)
                .input('ecart', sql.Decimal(22, 9), data.ecart)
                .input('statut', sql.NVarChar(10), data.statut)
                .input('validatedat', sql.DateTime, new Date())
                .input('validatedby', sql.NVarChar(100), data.validatedby)
                .query(caisseperiodeQueries.CLOSE_PERIODE);
            return result;

        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    async validation_caisseperiode(idperiode, data) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idperiode', sql.UniqueIdentifier, idperiode)
                .input('ecart', sql.Decimal(22, 9), data.ecart)
                .input('statut', sql.NVarChar(10), data.statut)
                .input('validatedat', sql.DateTime, data.validatedat)
                .input('validatedby', sql.NVarChar(100), data.validatedby)
                .query(caisseperiodeQueries.VALIDATE_PERIODE);
            return result;
        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    async delete_caisse(idperiode) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idperiode', sql.UniqueIdentifier, idperiode)
                .query(caisseperiodeQueries.DELETE);
            return { success: true, data: result };
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
        }
    }

    async create_caissebilletage(data) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idbilletage', sql.UniqueIdentifier, data.idbilletage)
                .input('idperiode', sql.UniqueIdentifier, data.idperiode)
                .input('valeur', sql.Decimal(22, 9), data.valeur)
                .input('quantite', sql.Decimal(22, 9), data.quantite)
                .input('montant', sql.Decimal(22, 9), data.montant)
                .input('ecart', sql.Decimal(22, 9), data.ecart)
                .input('createdat', sql.DateTime, data.createdat)
                .input('createdby', sql.NVarChar(100), data.createdby)
                .query(caisseperiodeQueries.INSERTBILLET);

            return { success: true, data: result.recordset[0] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_previous_periode(idcaisse, dateperiode) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idcaisse', sql.UniqueIdentifier, idcaisse)
                .input('dateperiode', sql.Date, dateperiode)
                .query(caisseperiodeQueries.CAISSE_PERIODE);

            const caisseperiode = result.recordset[0];
            let caisse = null;

            if (caisseperiode.idcaisse) {
                caisse = await caissemodel.get_onecaisse(caisseperiode.idcaisse);
            }

            return { ...caisseperiode, caisse: caisse };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_periodes_between(idcaisse, startDate, endDate) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idcaisse', sql.UniqueIdentifier, idcaisse)
                .input('startDate', sql.Date, startDate)
                .input('endDate', sql.Date, endDate)
                .query(caisseperiodeQueries.PERIODE_RECALCUL);

            return result.recordset;
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update_soldes(
        transaction,
        idperiode,
        soldeOuverture,
        soldeFermeture,
        ecart) {

        return transaction.request()
            .input('idperiode', sql.UniqueIdentifier, idperiode)
            .input('soldeouverture', sql.Decimal(22, 9), soldeOuverture)
            .input('soldefermeture', sql.Decimal(22, 9), soldeFermeture)
            .input('ecart', sql.Decimal(22, 9), ecart)
            .query(`
              UPDATE CaissePeriode
              SET
                  soldeouverture = @soldeouverture,
                  soldefermeture = @soldefermeture,
                  ecart = @ecart
              WHERE idperiode = @idperiode
          `);
    }

    async update_soldeouverture(
        transaction,
        idperiode,
        soldeOuverture) {

        return transaction.request()
            .input('idperiode', sql.UniqueIdentifier, idperiode)
            .input('soldeouverture', sql.Decimal(22, 9), soldeOuverture)
            .query(`
              UPDATE CaissePeriode
              SET
                  soldeouverture = @soldeouverture
              WHERE idperiode = @idperiode
          `);
    }

    async get_caisse_tresorerie_by_date(startDate, endDate, idcaisse) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('startDate', sql.Date, startDate || null)
                .input('endDate', sql.Date, endDate || null)
                .input('idcaisse', sql.UniqueIdentifier, idcaisse || null)
                .query(caisseperiodeQueries.SOLDE_PERIODE);
            return result.recordset;
        } catch (error) {
            console.log(`Erreur de récupération du solde caisse: ${error}`.cyan.bold);
        }
    }

    async get_solde_date() {
        const pool = await connectDB();
        try {
            const result = await pool.request().query(caisseperiodeQueries.SOLDE_DATE);
            return result.recordset;
        } catch (error) {
            console.log(`Erreur de récupération du solde caisse: ${error}`.cyan.bold);
            throw new Error(error);
            
        }
    }
}



module.exports = caisseperiodeModel;