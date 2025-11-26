const { DateTime } = require('mssql');
const {sql, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

const queryInsert = `
        INSERT INTO Journal (idjournal, codejournal, designation, actif, createdat, createdby, updatedat, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idjournal,@codejournal, @designation, @actif, @createdat, @createdby, @updatedat, @updatedby)
        `;

const queryUpdate = `UPDATE Journal SET codejournal = @codejournal, designation = @designation, actif = @actif, updatedat = @updatedat, updatedby = @updatedby OUTPUT INSERTED.* WHERE codejournal = @codejournal`;

class journalModel {
    constructor(idjournal,codejournal,designation,actif,createdat,createdby,updatedat,updatedby)
    {
        this.idjournal = idjournal;
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
            return { success: false, message: error.message };
        }
    }

    async get_alljournals () {
        const pool = await connectDB();
        const query = "SELECT * FROM Journal"
        try {
            const result = await pool.request().query(query);
            return result;
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