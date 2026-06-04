const { sql, connectDB } = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

// ===============================
// INSERT
// ===============================
const queryInsert = `
    INSERT INTO CircuitValidateur (
        idcircuitvalidateur, codecircuitvalidateur, idutilisateur, idsociete,
        idcircuitvalidation, rangvalidation, createdat, createdby, updatedat, updatedby
    )
    OUTPUT INSERTED.*
    VALUES (
        @idcircuitvalidateur, @codecircuitvalidateur, @idutilisateur, @idsociete,
        @idcircuitvalidation, @rangvalidation, @createdat, @createdby, @updatedat, @updatedby
    )
`;

// ===============================
// UPDATE
// ===============================
const queryUpdate = `
    UPDATE CircuitValidateur 
    SET 
        codecircuitvalidateur = @codecircuitvalidateur,
        idutilisateur        = @idutilisateur,
        idsociete            = @idsociete,
        idcircuitvalidation  = @idcircuitvalidation,
        rangvalidation       = @rangvalidation,
        updatedat            = @updatedat,
        updatedby            = @updatedby
    OUTPUT INSERTED.*
    WHERE idcircuitvalidateur = @idcircuitvalidateur
`;

// ======================================================
//  CLASS MODEL
// ======================================================
class circuitvalidateurmodel {

    constructor(idcircuitvalidateur, codecircuitvalidateur, idutilisateur, idsociete, idcircuitvalidation,
        rangvalidation, createdat, createdby, updatedat, updatedby)
    {
        this.idcircuitvalidateur = idcircuitvalidateur;
        this.codecircuitvalidateur = codecircuitvalidateur;
        this.idutilisateur = idutilisateur;
        this.idsociete = idsociete;
        this.idcircuitvalidation = idcircuitvalidation;
        this.rangvalidation = rangvalidation;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;
    }

    // ==========================================
    // CREATE
    // ==========================================
    async create_circuitvalidateurmodel() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idcircuitvalidateur', sql.UniqueIdentifier, this.idcircuitvalidateur)
                .input('codecircuitvalidateur', sql.NVarChar(24), this.codecircuitvalidateur)
                .input('idutilisateur', sql.UniqueIdentifier, this.idutilisateur)
                .input('idsociete', sql.UniqueIdentifier, this.idsociete)
                .input('idcircuitvalidation', sql.UniqueIdentifier, this.idcircuitvalidation)
                .input('rangvalidation', sql.Int, this.rangvalidation)
                .input('createdat', sql.DateTime, this.createdat)
                .input('createdby', sql.NVarChar(50), this.createdby)
                .input('updatedat', sql.DateTime, this.updatedat)
                .input('updatedby', sql.NVarChar(50), this.updatedby)
                .query(queryInsert);

            return result.recordset[0];
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // ==========================================
    // GET ALL
    // ==========================================
    async get_allcircuitvalidateur() {
        const pool = await connectDB();
        const query = "SELECT * FROM CircuitValidateur";
        return await pool.request().query(query);
    }

    // ==========================================
    // GET ONE
    // ==========================================
    async get_onecircuitvalidateur(id) {
        const pool = await connectDB();
        const result = await pool.request()
            .input("idcircuitvalidateur", sql.UniqueIdentifier, id)
            .query("SELECT * FROM CircuitValidateur WHERE idcircuitvalidateur = @idcircuitvalidateur");

        return result.recordset[0];
    }

    // ==========================================
    // UPDATE
    // ==========================================
    async update_circuitvalidateur(idcircuitvalidateur) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idcircuitvalidateur', sql.UniqueIdentifier, idcircuitvalidateur)
                .input('codecircuitvalidateur', sql.NVarChar(24), this.codecircuitvalidateur)
                .input('idutilisateur', sql.UniqueIdentifier, this.idutilisateur)
                .input('idsociete', sql.UniqueIdentifier, this.idsociete)
                .input('idcircuitvalidation', sql.UniqueIdentifier, this.idcircuitvalidation)
                .input('rangvalidation', sql.Int, this.rangvalidation)
                .input('updatedat', sql.DateTime, this.updatedat)
                .input('updatedby', sql.NVarChar(50), this.updatedby)
                .query(queryUpdate);

            return result.recordset[0];
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // ==========================================
    // DELETE
    // ==========================================
    async delete_circuitvalidateur(id) {
        const pool = await connectDB();
        return await pool.request()
            .input('idcircuitvalidateur', sql.UniqueIdentifier, id)
            .query("DELETE FROM CircuitValidateur WHERE idcircuitvalidateur = @idcircuitvalidateur");
    }
}

module.exports = circuitvalidateurmodel;
