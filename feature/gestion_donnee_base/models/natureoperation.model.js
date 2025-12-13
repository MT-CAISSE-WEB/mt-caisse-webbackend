const { sql, connectDB } = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

class NatureOperationModel {
    constructor({
        idnature = uuidv4(),
        codenature,
        idsociete,
        idcompte,
        libelle,
        avanceAjustifier = 1,
        imputationTiers = 1,
        actif = 1,
        demandeDecaissement = 0,
        createdat = new Date(),
        createdby,
        updatedat = new Date(),
        updatedby = createdby,
    }) {
        this.idnature = idnature;
        this.codenature = codenature;
        this.idsociete = idsociete;
        this.idcompte = idcompte;
        this.libelle = libelle;
        this.avanceAjustifier = avanceAjustifier;
        this.imputationTiers = imputationTiers;
        this.actif = actif;
        this.demandeDecaissement = demandeDecaissement;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;
    }

    async create() {
        const pool = await connectDB();

        const query = `
            INSERT INTO NatureOperation
            (idnature, codenature, idsociete, idcompte, libelle, avanceAjustifier,
            imputationTiers, actif, demandeDecaissement,
            createdat, createdby, updatedat, updatedby)
            OUTPUT INSERTED.*
            VALUES
            (@idnature, @codenature, @idsociete, @idcompte, @libelle, @avanceAjustifier,
            @imputationTiers, @actif, @demandeDecaissement,
            @createdat, @createdby, @updatedat, @updatedby)
        `;

        try {
            const result = await pool.request()
                .input("idnature", sql.UniqueIdentifier, this.idnature)
                .input("codenature", sql.NVarChar(50), this.codenature)
                .input("idsociete", sql.UniqueIdentifier, this.idsociete)
                .input("idcompte", sql.UniqueIdentifier, this.idcompte)
                .input("libelle", sql.NVarChar(150), this.libelle)
                .input("avanceAjustifier", sql.Int, this.avanceAjustifier)
                .input("imputationTiers", sql.Int, this.imputationTiers)
                .input("actif", sql.Int, this.actif)
                .input("demandeDecaissement", sql.Int, this.demandeDecaissement)
                .input("createdat", sql.DateTime, this.createdat)
                .input("createdby", sql.NVarChar(50), this.createdby)
                .input("updatedat", sql.DateTime, this.updatedat)
                .input("updatedby", sql.NVarChar(50), this.updatedby)
                .query(query);

            return result.recordset[0];
        } catch (e) {
            throw new Error(e.message);
        }
    }
}

module.exports = NatureOperationModel;
