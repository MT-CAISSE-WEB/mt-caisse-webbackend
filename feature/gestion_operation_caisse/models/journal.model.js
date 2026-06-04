const { DateTime } = require('mssql');
const {sql, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const societe = require("../../gestion_organisation/models/departement.model"); 
const { journalQueries } = require('../queries/queryIndex');

const queryInsert = `
        INSERT INTO Journal (idjournal, idsociete, codejournal, designation, actif, createdat, createdby, updatedat, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idjournal, @idsociete, @codejournal, @designation, @actif, @createdat, @createdby, @updatedat, @updatedby)
        `;

const queryUpdate = `UPDATE Journal SET codejournal = @codejournal, designation = @designation, actif = @actif, updatedat = @updatedat, updatedby = @updatedby OUTPUT INSERTED.* WHERE codejournal = @codejournal`;

const query = `
        SELECT *
        FROM Journal 
        WHERE 1 = 1
            --Search : codecaisse, devise, journal
            AND (
                @search IS NULL OR 
                c.idcaisse LIKE @search OR 
                EXISTS (
                    SELECT 1 FROM Devise dev
                    WHERE dev.iddevise = c.iddevise AND dev.codedevise = @search
                ) OR EXISTS (
                    SELECT 1 FROM Journal jou
                    WHERE jou.idjournal = c.idjournal AND jou.codejournal = @search
                )
            ) AND (@actif IS NULL OR actif = @actif)
        ORDER BY createdat DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY;

        SELECT COUNT(*) AS total FROM Journal;
    `;

class journalModel {
    constructor(idjournal,codejournal, idsociete, designation,actif,createdat,createdby,updatedat,updatedby)
    {
        this.idjournal = idjournal;
        this.idsociete = idsociete;
        this.codejournal = codejournal;
        this.designation = designation;
        this.actif = actif;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;
    }

    async create_journalmodel() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idjournal', sql.UniqueIdentifier, this.idjournal)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('codejournal', sql.NVarChar(24), this.codejournal)
            .input('designation', sql.NVarChar(50), this.designation)
            .input('actif', sql.Int, this.actif)
            .input('createdat', sql.DateTime, this.createdat)
            .input('createdby', sql.NVarChar(100), this.createdby)
            .input('updatedat', sql.DateTime, this.updatedat)
            .input('updatedby', sql.NVarChar(100), this.updatedby)
            .query(queryInsert);
            
            return { success: true, data: result.recordset[0] };
        } catch (error) {
            console.log(error);
            return { success: false, message: error.message };
        }
    }

    async get_alljournals ({ page = 1, limit = 10, search = null, actif = null}) {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 5;
        
        const pool = await connectDB();
        const offset = (page - 1) * limit;
        try {
            const result = await pool.request()
                .input('offset', sql.Int, offset)
                .input('limit', sql.Int, limit)
                .input('search', sql.NVarChar, search ? `%${search}%` : null)
                .input('actif', sql.Int, actif || null)
            .query(journalQueries.getAll);

            const journals = result.recordsets[0];
            const total = result.recordsets[1][0].total;
            const totalPages = Math.ceil(total / limit);

            return {page, limit, total, totalPages, data: journals};
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }

    async get_onejournal(idjournal){
        const pool = await connectDB();
        try {
            const result = await pool.request().input('idjournal', sql.UniqueIdentifier, idjournal).query('SELECT * FROM Journal WHERE idjournal = @idjournal');
            const journal = result.recordset[0];
            return journal;
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update_journal (codejournal, data) {
        const pool = await connectDB();
        try {
            const check = await pool.request()
            .input('codejournal', sql.NVarChar(50), codejournal)
            .query(`SELECT COUNT(*) AS count FROM Journal WHERE codejournal = @codejournal`);

            // S'il existe update
            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('idjournal', sql.UniqueIdentifier, data.idjournal)
                    .input('codejournal', sql.NVarChar(24), data.codejournal)
                    .input('designation', sql.NVarChar(50), data.designation)
                    .input('actif', sql.Int, data.actif)
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(100), data.updatedby)
                    .query(queryUpdate);
                return result;
            } else {
                // 3️ Sinon → INSERT
                const result = await pool.request()
                    .input('idjournal', sql.UniqueIdentifier, uuidv4())
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('codejournal', sql.NVarChar(24), data.codejournal)
                    .input('designation', sql.NVarChar(50), data.designation)
                    .input('actif', sql.Int, data.actif)
                    .input('createdat', sql.DateTime, new Date())
                    .input('createdby', sql.NVarChar(100), data.createdby || 'System')
                    .input('updatedat', sql.DateTime, new Date())
                    .input('updatedby', sql.NVarChar(100), data.updatedby || 'System')
                    .query(queryInsert);
                return result;
            }
        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    async delete_journal (idjournal) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idjournal', sql.UniqueIdentifier, idjournal)
            .query("DELETE FROM Journal WHERE idjournal = @idjournal");
            return { success: true, data: result };
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
        }
    }
}



module.exports = journalModel;