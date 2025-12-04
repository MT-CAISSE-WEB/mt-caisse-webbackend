const { sql, connectDB } = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

const queryInsert = `
    INSERT INTO UtilisateurDepartement
        (iduserdepartement, idutilisateur, iddepartement, idsociete, debutactivite, 
        finactivite, createdat, createdby, updatedat, updatedby)
    OUTPUT INSERTED.*
    VALUES
        (@iduserdepartement, @idutilisateur, @iddepartement, @idsociete, @debutactivite, @finactivite, @createdat, @createdby, @updatedat, @updatedby)
`;

const queryUpdate = `
    UPDATE UtilisateurDepartement
    SET
        idutilisateur = @idutilisateur,
        iddepartement = @iddepartement,
        idsociete = @idsociete,
        debutactivite = @debutactivite,
        finactivite = @finactivite,
        updatedat = @updatedat,
        updatedby = @updatedby
    OUTPUT INSERTED.*
    WHERE iduserdepartement = @iduserdepartement
`;

class utilisateurDepartementModel {
    constructor(iduserdepartement = null, idutilisateur, iddepartement, idsociete, debutactivite,
        finactivite, createdat = new Date(), createdby, updatedat = new Date(), updatedby = null) {
        
        this.iduserdepartement = iduserdepartement || uuidv4();
        this.idutilisateur = idutilisateur;
        this.iddepartement = iddepartement;
        this.idsociete = idsociete;
        this.debutactivite = debutactivite;
        this.finactivite = finactivite;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby || createdby;
    }

    async create() {
        const pool = await connectDB();
        try {
            const result = await pool
                .request()
                .input('iduserdepartement', sql.UniqueIdentifier, this.iduserdepartement)
                .input('idutilisateur', sql.UniqueIdentifier, this.idutilisateur)
                .input('iddepartement', sql.UniqueIdentifier, this.iddepartement)
                .input('idsociete', sql.UniqueIdentifier, this.idsociete)
                .input('debutactivite', sql.DateTime, this.debutactivite)
                .input('finactivite', sql.DateTime, this.finactivite)
                .input('createdat', sql.DateTime, this.createdat)
                .input('createdby', sql.NVarChar(50), this.createdby)
                .input('updatedat', sql.DateTime, this.updatedat)
                .input('updatedby', sql.NVarChar(50), this.updatedby)
                .query(queryInsert);

            return { success: true, data: result.recordset[0] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update(data) {
        const pool = await connectDB();
        try {
            const result = await pool
                .request()
                .input('iduserdepartement', sql.UniqueIdentifier, this.iduserdepartement)
                .input('idutilisateur', sql.UniqueIdentifier, data.idutilisateur)
                .input('iddepartement', sql.UniqueIdentifier, data.iddepartement)
                .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                .input('debutactivite', sql.DateTime, data.debutactivite)
                .input('finactivite', sql.DateTime, data.finactivite)
                .input('updatedat', sql.DateTime, data.updatedat || new Date())
                .input('updatedby', sql.NVarChar(50), data.updatedby || this.updatedby)
                .query(queryUpdate);

            return { success: true, data: result.recordset[0] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_all() {
        const pool = await connectDB();
        try {
            return await pool.request().query("SELECT * FROM UtilisateurDepartement");
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_one() {
        const pool = await connectDB();
        try {
            const result = await pool
                .request()
                .input('iduserdepartement', sql.UniqueIdentifier, this.iduserdepartement)
                .query("SELECT * FROM UtilisateurDepartement WHERE iduserdepartement = @iduserdepartement");

            return result.recordset[0]
                ? { success: true, data: result.recordset[0] }
                : { success: false, message: "L'utilisateur–département est introuvable" };

        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async delete() {
        const pool = await connectDB();
        try {
            await pool
                .request()
                .input('iduserdepartement', sql.UniqueIdentifier, this.iduserdepartement)
                .query("DELETE FROM UtilisateurDepartement WHERE iduserdepartement = @iduserdepartement");

            return { success: true, message: "Utilisateur–département supprimé avec succès" };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

module.exports = utilisateurDepartementModel;
