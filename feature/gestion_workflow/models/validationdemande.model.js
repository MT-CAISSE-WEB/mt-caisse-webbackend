const { sql, connectDB } = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

// ===============================
// INSERT
// ===============================
const queryInsert = `
    INSERT INTO ValidationDemande (
        idvalidationdemande, iddemande, idsociete, datevalidation,
        createdat, createdby, updatedat, updatedby
    )
    OUTPUT INSERTED.*
    VALUES (
        @idvalidationdemande, @iddemande, @idsociete, @datevalidation, @createdat, @createdby, @updatedat, @updatedby
    )
`;

// ===============================
// UPDATE
// ===============================
const queryUpdate = `
    UPDATE ValidationDemande 
    SET 
        iddemande = @iddemande,
        idsociete = @idsociete,
        datevalidation = @datevalidation,
        updatedat = @updatedat,
        updatedby = @updatedby
    OUTPUT INSERTED.*
    WHERE idvalidationdemande = @idvalidationdemande
`;

// ======================================================
//  CLASS MODEL
// ======================================================
class validationdemandemodel {

    constructor(idvalidationdemande, iddemande, idsociete, datevalidation, createdat, createdby, updatedat, updatedby)
    {
        this.idvalidationdemande = idvalidationdemande;
        this.iddemande = iddemande;
        this.idsociete = idsociete;
        this.datevalidation = datevalidation;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;
    }

    // ==========================================
    // CREATE
    // ==========================================
    async create_validationdemandemodel() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idvalidationdemande', sql.UniqueIdentifier, this.idvalidationdemande)
                .input('iddemande', sql.UniqueIdentifier, this.iddemande)
                .input('idsociete', sql.UniqueIdentifier, this.idsociete)
                .input('datevalidation', sql.DateTime, this.datevalidation)
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
    async get_allvalidationdemande() {
        const pool = await connectDB();
        const query = "SELECT * FROM ValidationDemande";
        return await pool.request().query(query);
    }

    // ==========================================
    // GET ONE
    // ==========================================
    async get_onevalidationdemande(id) {
        const pool = await connectDB();
        const result = await pool.request()
            .input("idvalidationdemande", sql.UniqueIdentifier, id)
            .query("SELECT * FROM ValidationDemande WHERE idvalidationdemande = @idvalidationdemande");

        return result.recordset[0];
    }

    // ==========================================
    // UPDATE
    // ==========================================
  async update_validationdemande(id, data) {
    const pool = await connectDB();
    try {
        const result = await pool.request()
            .input('idvalidationdemande', sql.UniqueIdentifier, id)
            .input('iddemande', sql.UniqueIdentifier, data.iddemande)
            .input('idsociete', sql.UniqueIdentifier, data.idsociete)
            .input('datevalidation', sql.DateTime, data.datevalidation)
            .input('updatedat', sql.DateTime, new Date())
            .input('updatedby', sql.NVarChar(50), data.updatedby || 'System')
            .query(queryUpdate);

        return result.recordset[0];
    } catch (error) {
        return { success: false, message: error.message };
    }
}


    // ==========================================
    // DELETE
    // ==========================================
    async delete_validationdemande(id) {
        const pool = await connectDB();
        return await pool.request()
            .input('idvalidationdemande', sql.UniqueIdentifier, id)
            .query("DELETE FROM ValidationDemande WHERE idvalidationdemande = @idvalidationdemande");
    }
}

module.exports = validationdemandemodel;
