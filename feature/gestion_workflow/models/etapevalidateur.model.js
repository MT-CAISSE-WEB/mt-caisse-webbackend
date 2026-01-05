const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');




const queryInsert = `
        INSERT INTO Etapevalidateur (idcircuitetape,idutilisateur,
        createdat, createdby, updatedat, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idcircuitetape, @idutilisateur,GETDATE(),@createdby, @updatedat, @updatedby)
        `;

const queryUpdate = `
UPDATE Etapevalidateur SET
    idcircuitetape= @idcircuitetape,
    idutilisateur = @idutilisateur,
    updatedat = GETDATE(),
    updatedby = @updatedby
WHERE idcircuitetape = @idcircuitetape AND idutilisateur = @idutilisateur`;

class etapevalidateurmodel {
    constructor(idcircuitetape,idutilisateur,
        createdat, createdby, updatedat, updatedby)
    {
        this.idcircuitetape = idcircuitetape;
        this.idutilisateur = idutilisateur;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;
    }

    async create_etapevalidateurmodel() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idcircuitetape', sql.NVARCHAR(24) , this.idcircuitetape)
            .input('idutilisateur', sql.UniqueIdentifier, this.idutilisateur)
            .input('createdat', sql.DateTime, this.createdat)
            .input('createdby', sql.NVARCHAR(50), this.createdby)
        
           
            .query(queryInsert);
            
            return { success: true, data: result.recordset[0] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_alletapevalidateur () {
        const pool = await connectDB();
        const query = `SELECT * FROM etapevalidateur`;
        try {
            const result = await pool.request().query(query);
            return result;
        } catch (error) {
              return {
                success: false,
                message:`Erreur de recuperation: ${error}`,
            };
        }
    }

async get_oneetapevalidateur(idcircuitetape,idutilisateur) {
    const pool = await connectDB();

    try {
        const result = await pool.request()
            .input("idcircuitetape", sql.UniqueIdentifier, idcircuitetape)
            .input("idutilisateur", sql.UniqueIdentifier, idutilisateur)
            .query("SELECT * FROM Etapevalidateur WHERE idcircuitetape = @idcircuitetape and idutilisateur=@idutilisateur");

        if (result.recordset.length === 0) {
            return {
                success: false,
                message: "Aucune donnée trouvée"
            };
        }

        return {
            success: true,
            data: result.recordset[0]
        };

    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}


    async update_etapevalidateur(idcircuitetape,idutilisateur) {
    const pool = await connectDB();

    try {

        // Vérifier si l'ID existe
        const check = await pool.request()
            .input('idcircuitetape', sql.UniqueIdentifier, idcircuitetape)
            .input('idutilisateur', sql.UniqueIdentifier, idutilisateur)
            .query("SELECT COUNT(*) AS count FROM Etapevalidateur WHERE idcircuitetape = @idcircuitetape and idutilisateur = @idutilisateur");

        if (check.recordset[0].count === 0) {
            return { success: false, message: "Aucun circuit trouvé avec cet ID." };
        }

        // Mise à jour
        const result = await pool.request()
            .input('idcircuitetape', sql.UniqueIdentifier, idcircuitetape)
            .input('idutilisateur', sql.UniqueIdentifier, idutilisateur)
            .input('updatedat', sql.DateTime, new Date())
            .input('updatedby', sql.NVarChar(50), data.updatedby)
            .query(queryUpdate);

        return {
            success: true,
            message: "Mise à jour effectuée",
            //data: result
        };

    } catch (error) {
        return { success: false, message: error.message };
    }
}

async delete_etapevalidateur(idcircuitetape,idutilisateur) {
    const pool = await connectDB();

    try {
        const result = await pool.request()
            .input('idcircuitetape', sql.UniqueIdentifier, idcircuitetape)
            .input('idutilisateur', sql.UniqueIdentifier, idutilisateur)
            .query("DELETE FROM Etapevalidateur WHERE idcircuitetape = @idcircuitetape and idutilisateur =@idutilisateur");

        if (result.rowsAffected[0] === 0) {
            return { 
                success: false, 
                message: "Aucun circuit etape trouvé avec cet ID." 
            };
        }

        return { 
            success: true, 
            message: "circuit etape supprimé avec succès." 
        };

    } catch (error) {
        return { success: false, message: error.message };
    }
}

}



module.exports = etapevalidateurmodel;