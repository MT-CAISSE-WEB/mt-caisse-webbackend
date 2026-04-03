const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const { motifQueries } = require('../queries/queryIndex');


class motifModel {
    constructor( idmotif, codemotif, libellemotif, createdat, createdby, updatedat, updatedby) {
        this.idmotif = idmotif;
        this.codemotif = codemotif;
        this.libellemotif = libellemotif;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;
    }

    async create_motif() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idmotif', sql.UniqueIdentifier, this.idmotif)
                .input('codemotif', sql.NVarChar(50), this.codemotif)
                .input('libellemotif', sql.NVarChar(150), this.libellemotif)
                .input('createdat', sql.DateTime, this.createdat)
                .input('createdby', sql.NVarChar(50), this.createdby)
                .input('updatedat', sql.DateTime, this.updatedat)
                .input('updatedby', sql.NVarChar(50), this.updatedby)
                .query(motifQueries.insert);

            return { success: true, data: result.recordset };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_allmotifs({ page = 1, limit = 10, search = null }) {
        const pool = await connectDB();
        const offset = (page - 1) * limit;

        const result = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .input('search', sql.NVarChar, search ? `%${search}%` : null)
            .query(motifQueries.getall);

        return {
            page,
            limit,
            total: result.recordsets[1][0].total,
            data: result.recordsets[0]
        };
    }

    async update(codemotif, data) {
        const pool = await connectDB();
        try {
            const check = await pool.request()
                .input('codemotif', sql.NVarChar(50), codemotif)
                .query(`SELECT COUNT(*) AS count FROM Motif WHERE codemotif = @codemotif`);

            // S'il existe update
            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('idmotif', sql.UniqueIdentifier, data.idmotif)
                    .input('codemotif', sql.NVarChar(50), data.codemotif)
                    .input('libellemotif', sql.NVarChar(150), data.libellemotif)
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(100), data.updatedby)
                    .query(motifQueries.update);
                return result;
            } else {
                // 3️ Sinon → INSERT
                this.create_motif(data)
            }
        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    async get_onemotif(idmotif) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idmotif', sql.UniqueIdentifier, idmotif)
            .query(`SELECT * FROM Motif WHERE idmotif = @idmotif`);
        return result.recordset[0];
    }

    async delete_motif(idmotif) {
        const pool = await connectDB();
        await pool.request()
            .input('idmotif', sql.UniqueIdentifier, idmotif)
            .query(`DELETE FROM Motif WHERE idmotif = @idmotif`);
        return { success: true };
    }
}

module.exports = motifModel;
