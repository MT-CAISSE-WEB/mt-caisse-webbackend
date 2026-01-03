const { DateTime } = require('mssql');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
//const utilisateur = require('');
//const societe = require('');



const queryInsert = `
        INSERT INTO CircuitValidation (idcircuitvalidation, codecircuitvalidation, typeentite, typeaction, idsociete, idsite, iddepartement, nombrevalidateur, actif,
        createdat, createdby, updatedat, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idcircuitvalidation, @codecircuitvalidation, @typeentite, @typeaction, @idsociete, @idsite, @iddepartement, @nombrevalidateur, @actif, @createdat, @createdby, @updatedat, @updatedby)
        `;

const queryUpdate = `
UPDATE CircuitValidation SET
    codecircuitvalidation = @codecircuitvalidation,
    typeentite = @typeentite,
    typeaction = @typeaction,
    idsociete = @idsociete,
    idsite = @idsite,
    iddepartement = @iddepartement,
    nombrevalidateur = @nombrevalidateur,
    actif = @actif,
    updatedat = @updatedat,
    updatedby = @updatedby
WHERE idcircuitvalidation = @idcircuitvalidation
`;

class circuitvalidationmodel {
    constructor(idcircuitvalidation, codecircuitvalidation, typeentite, typeaction, idsociete, idsite,  iddepartement, nombrevalidateur, actif,
        createdat, createdby, updatedat, updatedby)
    {
        this.idcircuitvalidation = idcircuitvalidation;
        this.codecircuitvalidation = codecircuitvalidation;
        this.typeentite = typeentite;
        this.typeaction = typeaction;
        this.idsociete = idsociete;
        this.idsite = idsite;
        this.iddepartement = iddepartement;
        this.nombrevalidateur = nombrevalidateur;
        this.actif = actif;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;
        
      
    }

    async create_circuitvalidationmodel() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idcircuitvalidation', sql.UniqueIdentifier, this.idcircuitvalidation)
            .input('codecircuitvalidation', sql.NVARCHAR(24) , this.codecircuitvalidation)
            .input('typeentite', sql.NVARCHAR(100), this.typeentite)
            .input('typeaction', sql.NVARCHAR(100), this.typeaction)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('idsite', sql.UniqueIdentifier, this.idsite)
            .input('iddepartement', sql.UniqueIdentifier, this.iddepartement)
            .input('nombrevalidateur', sql.INT, this.nombrevalidateur)
            .input('actif', sql.INT , this.actif)
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

    async get_allcircuitvalidation () {
        const pool = await connectDB();
        const query = "SELECT * FROM CircuitValidation"
        try {
            const result = await pool.request().query(query);
            return result;
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }

async get_onecircuitvalidation(idcircuitvalidation) {
    const pool = await connectDB();

    try {
        const result = await pool.request()
            .input("idcircuitvalidation", sql.UniqueIdentifier, idcircuitvalidation)
            .query("SELECT * FROM CircuitValidation WHERE idcircuitvalidation = @idcircuitvalidation");

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


    async update_circuitvalidation(idcircuitvalidation, data) {
    const pool = await connectDB();

    try {

        // Vérifier si l'ID existe
        const check = await pool.request()
            .input('idcircuitvalidation', sql.UniqueIdentifier, idcircuitvalidation)
            .query("SELECT COUNT(*) AS count FROM CircuitValidation WHERE idcircuitvalidation = @idcircuitvalidation");

        if (check.recordset[0].count === 0) {
            return { success: false, message: "Aucun circuit trouvé avec cet ID." };
        }

        // Mise à jour
        const result = await pool.request()
            .input('idcircuitvalidation', sql.UniqueIdentifier, idcircuitvalidation)
            .input('codecircuitvalidation', sql.NVarChar(24), data.codecircuitvalidation)
            .input('typeentite', sql.NVarChar(100), data.typeentite)
            .input('typeaction', sql.NVarChar(100), data.typeaction)
            .input('idsociete', sql.UniqueIdentifier, data.idsociete)
            .input('idsite', sql.UniqueIdentifier, data.idsite)
            .input('iddepartement', sql.UniqueIdentifier, data.iddepartement)
            .input('nombrevalidateur', sql.Int, data.nombrevalidateur)
            .input('actif', sql.Int, data.actif)
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

async delete_circuitvalidation(idcircuitvalidation) {
    const pool = await connectDB();

    try {
        const result = await pool.request()
            .input('idcircuitvalidation', sql.UniqueIdentifier, idcircuitvalidation)
            .query("DELETE FROM CircuitValidation WHERE idcircuitvalidation = @idcircuitvalidation");

        if (result.rowsAffected[0] === 0) {
            return { 
                success: false, 
                message: "Aucun circuit de validation trouvé avec cet ID." 
            };
        }

        return { 
            success: true, 
            message: "Circuit de validation supprimé avec succès." 
        };

    } catch (error) {
        return { success: false, message: error.message };
    }
}

}



module.exports = circuitvalidationmodel;