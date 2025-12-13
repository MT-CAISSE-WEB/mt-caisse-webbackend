const NatureOperationModel = require("../models/natureoperation.model");
const { sql, connectDB } = require('../../../config/db');

class NatureOperationService {

    async get_all() {
        const pool = await connectDB();
        const result = await pool.request().query("SELECT * FROM NatureOperation ORDER BY createdat DESC");
        return result.recordset;
    }

    async get_one(idnature) {
        const pool = await connectDB();
        const result = await pool.request()
            .input("idnature", sql.UniqueIdentifier, idnature)
            .query("SELECT * FROM NatureOperation WHERE idnature = @idnature");

        return result.recordset[0];
    }

    async create(data) {
        const model = new NatureOperationModel(data);
        return await model.create();
    }

    async update(idnature, data) {
        const pool = await connectDB();
        const query = `
            UPDATE NatureOperation SET
                codenature=@codenature, idsociete=@idsociete, idcompte=@idcompte,
                libelle=@libelle, avanceAjustifier=@avanceAjustifier,
                imputationTiers=@imputationTiers, actif=@actif,
                demandeDecaissement=@demandeDecaissement,
                updatedat=@updatedat, updatedby=@updatedby
            OUTPUT INSERTED.*
            WHERE idnature=@idnature
        `;

        const result = await pool.request()
            .input("idnature", sql.UniqueIdentifier, idnature)
            .input("codenature", sql.NVarChar(50), data.codenature)
            .input("idsociete", sql.UniqueIdentifier, data.idsociete)
            .input("idcompte", sql.UniqueIdentifier, data.idcompte)
            .input("libelle", sql.NVarChar(150), data.libelle)
            .input("avanceAjustifier", sql.Int, data.avanceAjustifier)
            .input("imputationTiers", sql.Int, data.imputationTiers)
            .input("actif", sql.Int, data.actif)
            .input("demandeDecaissement", sql.Int, data.demandeDecaissement)
            .input("updatedat", sql.DateTime, new Date())
            .input("updatedby", sql.NVarChar(50), data.updatedby)
            .query(query);

        return result.recordset[0];
    }

    async delete(idnature) {
        const pool = await connectDB();
        await pool.request()
            .input("idnature", sql.UniqueIdentifier, idnature)
            .query("DELETE FROM NatureOperation WHERE idnature = @idnature");

        return true;
    }
}

module.exports = new NatureOperationService();
