const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');




const queryInsert = `
        INSERT INTO Circuitetape (idcircuitetape,idcircuitvalidation,ordre,nombrevalidateur
        createdat, createdby, updatedat, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idcircuitetape, @idcircuitvalidation, @ordre, @nombrevalidateur, @createdat, @createdby, @updatedat, @updatedby)
        `;

const queryUpdate = `
UPDATE Circuitetape SET
    idcircuitetape= @idcircuitetape,
    idcircuitvalidation = @idcircuitvalidation,
    ordre = @ordre,
    nombrevalidateur = @nombrevalidateur,
    updatedat = @updatedat,
    updatedby = @updatedby
WHERE idcircuitetape = @idcircuitetape
`;

class circuitetapemodel {
    constructor(idcircuitetape,idcircuitvalidation, ordre, nombrevalidateur,
        createdat, createdby, updatedat, updatedby)
    {
        this.idcircuitetape = idcircuitetape;
        this.idcircuitvalidation = idcircuitvalidation;
        this.ordre = ordre;
        this.nombrevalidateur = nombrevalidateur;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;
    }

    async create_circuitetapemodel() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idcircuitetape', sql.NVARCHAR(24) , this.idcircuitetape)
            .input('idcircuitvalidation', sql.UniqueIdentifier, this.idcircuitvalidation)
            .input('ordre', sql.NVARCHAR(100), this.ordre)
            .input('nombrevalidateur', sql.NVARCHAR(100), this.nombrevalidateur)
            .input('createdat', sql.DateTime, this.createdat)
            .input('createdby', sql.NVARCHAR(50), this.createdby)
            .input('updatedat', sql.DateTime, this.updatedat)
            .input('updatedby', sql.NVARCHAR(50), this.updatedby)
        
           
            .query(queryInsert);
            
            return { success: true, data: result.recordset[0] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_allcircuitetape () {
        const pool = await connectDB();
        const query = `SELECT * FROM circuitetape`;

        try {
            const result = await pool.request().query(query);
            return result;
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }

async get_onecircuitetape(idcircuitetape) {
    const pool = await connectDB();

    try {
        const result = await pool.request()
            .input("idcircuitetape", sql.UniqueIdentifier, idcircuitetape)
            .query("SELECT * FROM Circuitetape WHERE idcircuitetape = @idcircuitetape");

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


    async update_circuitetape(idcircuitetape, data) {
    const pool = await connectDB();

    try {

        // Vérifier si l'ID existe
        const check = await pool.request()
            .input('idcircuitetape', sql.UniqueIdentifier, idcircuitetape)
            .query("SELECT COUNT(*) AS count FROM Circuitetape WHERE idcircuitetape = @idcircuitetape");

        if (check.recordset[0].count === 0) {
            return { success: false, message: "Aucun circuit trouvé avec cet ID." };
        }

        // Mise à jour
        const result = await pool.request()
            .input('idcircuitetape', sql.UniqueIdentifier, idcircuitetape)
            .input('idcircuitvalidation', sql.NVarChar(24), data.idcircuitvalidation)
            .input('ordre', sql.NVarChar(100), data.ordre)
            .input('nombrevalidateur', sql.NVarChar(100), data.nombrevalidateur)
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

async delete_circuitetape(idcircuitetape) {
    const pool = await connectDB();

    try {
        const result = await pool.request()
            .input('idcircuitetape', sql.UniqueIdentifier, idcircuitetape)
            .query("DELETE FROM Circuitetape WHERE idcircuitetape = @idcircuitetape");

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



module.exports = circuitetapemodel;