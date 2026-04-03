const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const { piecejointeQueries } = require('../queries/queryIndex');

class pieceJointeModel {
    constructor( idpiecejointe, urlpiece, nomtable, idtable, dossier, createdat, createdby) {
        this.idpiecejointe = idpiecejointe;
        this.urlpiece = urlpiece;
        this.nomtable = nomtable;
        this.idtable = idtable;
        this.dossier = dossier;
        this.createdat = createdat;
        this.createdby = createdby;
    }

    async create_piecejointe() {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idpiecejointe', sql.UniqueIdentifier, this.idpiecejointe)
            .input('urlpiece', sql.UniqueIdentifier, this.urlpiece)
            .input('nomtable', sql.NVarChar(255), this.nomtable)
            .input('idtable', sql.NVarChar(500), this.idtable)
            .input('dossier', sql.NVarChar(50), this.dossier)
            .input('createdat', sql.DateTime, this.createdat)
            .input('createdby', sql.NVarChar(50), this.createdby)
            .query(piecejointeQueries.insert);

        return result;
    }

    async get_piecejointes(idpiecejointe) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idpiecejointe', sql.UniqueIdentifier, idpiecejointe)
            .query(piecejointeQueries.getone);
        return result.recordset;
    }

    async delete_piecejointe(idpiecejointe) {
        const pool = await connectDB();
        await pool.request()
            .input('idpiecejointe', sql.UniqueIdentifier, idpiecejointe)
            .query(piecejointeQueries.delete);
        return { success: true };
    }
}

module.exports = pieceJointeModel;
