const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const { compteurQueries } = require('../queries/queryIndex');


class compteurModel {
    constructor( idmodelecompteur,codemodelecompteur, libelle ,typedocument, sequence_1, prefixe_1, sequence_2, prefixe_2, createdat, createdby, updatedat, updatedby) {
        this.idmodelecompteur = idmodelecompteur;
        this.codemodelecompteur = codemodelecompteur;
        this.libelle = libelle;
        this.typedocument = typedocument;
        this.sequence_1 = sequence_1;
        this.prefixe_1 = prefixe_1;
        this.sequence_2 = sequence_2;
        this.prefixe_2 = prefixe_2;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;
    }

    async create_compteur() {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idmodelecompteur', sql.UniqueIdentifier, this.idmodelecompteur)
            .input('codemodelecompteur', sql.NVarChar(255), this.codemodelecompteur)
            .input('libelle', sql.NVarChar(255), this.libelle)
            .input('typedocument', sql.NVarChar(30), this.typedocument)
            .input('sequence_1', sql.NVarChar(20), this.sequence_1)
            .input('prefixe_1', sql.NVarChar(100), this.prefixe_1)
            .input('sequence_2', sql.NVarChar(20), this.sequence_2)
            .input('prefixe_2', sql.NVarChar(100), this.prefixe_2)
            .input('createdat', sql.DateTime, this.createdat)
            .input('createdby', sql.NVarChar(50), this.createdby)
            .query(compteurQueries.insert);

        return result;
    }

    async get_allcompteurs() {
        const pool = await connectDB();
        const result = await pool.request().query(compteurQueries.getall);
        return result.recordset;
    }

    async update(codemodelecompteur, data) {
        const pool = await connectDB();
        try {
            const check = await pool.request()
                .input('codemotif', sql.NVarChar(50), codemodelecompteur)
                .query(`SELECT COUNT(*) AS count FROM ModeleCompteur WHERE codemodelecompteur = @codemodelecompteur`);

            // S'il existe update
            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('libelle', sql.NVarChar(255), data.libelle)
                    .input('typedocument', sql.NVarChar(30), data.typedocument)
                    .input('sequence_1', sql.NVarChar(20), data.sequence_1)
                    .input('prefixe_1', sql.NVarChar(100), data.prefixe_1)
                    .input('sequence_2', sql.NVarChar(20), data.sequence_2)
                    .input('prefixe_2', sql.NVarChar(100), data.prefixe_2)
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(100), data.updatedby)
                    .query(motifQueries.update);
                return result;
            } else {
                // 3️ Sinon → INSERT
                this.create_compteur()
            }
        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    async get_onecompteur(idcompteur) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idmodelecompteur', sql.UniqueIdentifier, idcompteur)
            .query(compteurQueries.getone);
        return result.recordset[0];
    }

    async delete_compteur(idmodelecompteur) {
        const pool = await connectDB();
        await pool.request()
            .input('idmodelecompteur', sql.UniqueIdentifier, idmodelecompteur)
            .query(compteurQueries.delete);
        return { success: true };
    }
}

module.exports = compteurModel;
