const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const { parametreComptableQueries } = require('../queries/queryIndex');
const fieldMap = {
    journal: {
        column: 'idjournal',
        sqlType: sql.UniqueIdentifier
    },
    compteintermediaire: {
        column: 'idcompte',
        sqlType: sql.UniqueIdentifier
    },
    url: {
        column: 'urldossier',
        sqlType: sql.NVarChar(255)
    }
};


class ParametreComptableModel {
    constructor( idparametrecomptable,idsociete, idjournal ,idcompte, urldossier, createdat, createdby, updatedat, updatedby) {
        this.idparametrecomptable = idparametrecomptable;
        this.idsociete = idsociete;
        this.idjournal = idjournal;
        this.idcompte = idcompte;
        this.urldossier = urldossier;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;
    }

    async create_parametrecomptable() {
        this.idparametrecomptable = idparametrecomptable;
        this.idsociete = idsociete;
        this.idjournal = idjournal;
        this.idcompte = idcompte;
        this.urldossier = urldossier;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;
    }

    async create_parametrecomptable() {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idparametrecomptable', sql.UniqueIdentifier, this.idparametrecomptable)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('idjournal', sql.UniqueIdentifier, this.idjournal)
            .input('idcompte', sql.UniqueIdentifier, this.idcompte)
            .input('urldossier', sql.NVarChar(255), this.urldossier)
            .input('createdat', sql.DateTime, new Date())
            .input('createdby', sql.NVarChar(50), this.createdby)
            .input('updatedat', sql.DateTime, new Date())
            .input('updatedby', sql.NVarChar(50), this.updatedby)
            .query(parametreComptableQueries.insert);

        return result;
    }

    async get_allparametre() {
        const pool = await connectDB();
        const result = await pool.request().query(compteurQueries.getall);
        return result.recordset;
    }

    async get_parametrecomptable_bysociete(idsociete) {
        const pool = await connectDB();
        try {
            const result = await pool.request() 
            .input('idsociete', sql.UniqueIdentifier, idsociete)
            .query(parametreComptableQueries.getBySociete);
        
            return result.recordset;
        } catch (error) {
            console.error(`Error fetching parametre for societe ${idsociete}:`, error);
            throw error;
        }
    }

    async save(data) {
        const pool = await connectDB();

        try{
            const { societe, type, value, createdby, updatedby } = data;

            const field = fieldMap[type];
            if (!field) {
                throw new Error("Type de paramètre invalide");
            }

            const check = await pool.request()
                .input('idsociete', sql.UniqueIdentifier, societe)
                .query(`
                    SELECT COUNT(*) AS count 
                    FROM ParametreComptable 
                    WHERE idsociete = @idsociete
                `);
            
            const exists = check.recordset[0].count > 0;
            let result;

            if (exists) {
                //UPDATE dynamique
                result = await pool.request()
                    .input('idsociete', sql.UniqueIdentifier, societe)
                    .input('value', field.sqlType, value)
                    .input('updatedby', sql.NVarChar(50), updatedby || 'SYSTEM')
                    .query(`
                        UPDATE ParametreComptable
                        SET ${field.column} = @value, updatedat = GETDATE(), updatedby = @updatedby
                        OUTPUT INSERTED.* 
                        WHERE idsociete = @idsociete
                    `);
            } else {
                //INSERT avec valeur initiale
                result = await pool.request()
                    .input('idparametrecomptable', sql.UniqueIdentifier, uuidv4())
                    .input('idsociete', sql.UniqueIdentifier, societe)
                    .input('value', field.sqlType, value)
                    .input('createdby', sql.NVarChar(50), createdby || 'SYSTEM')
                    .query(`
                        INSERT INTO ParametreComptable (idparametrecomptable, idsociete, ${field.column}, createdat, createdby)
                        VALUES (@idparametrecomptable, @idsociete, @value, GETDATE(), @createdby)
                    `);
            }

            return {success: true, data: result.recordset[0]};
        }catch (error) {
            console.log(`Erreur save parametre: ${error}`);
            throw error;
        }
    }

    async delete_parametrecomptable(idparametrecomptable) {
        const pool = await connectDB();
        await pool.request()
            .input('idparametrecomptable', sql.UniqueIdentifier, idparametrecomptable)
            .query(parametreComptableQueries.delete);
        return { success: true };
    }
}

module.exports = ParametreComptableModel;
