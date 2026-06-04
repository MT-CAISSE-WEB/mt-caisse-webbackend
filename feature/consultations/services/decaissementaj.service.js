const { connectDB } = require('../../../config/db');
const sql = require('mssql');
const { decaissementajQueries } = require('../queries/queryIndex');


async function getAllDecaissementAj(data){
    const pool = await connectDB();
    
    try {
        const result = await pool.request()
            .input('typeoperation', sql.NVarChar, data.typeoperation)
            .input('codeoperation', sql.NVarChar, data.codeoperation)
            .input('tiers', sql.NVarChar, data.tiers)
            .input('datedebut', sql.DateTime, data.datedebut)
            .input('datefin', sql.DateTime, data.datefin)
            .query(decaissementajQueries.getall);
            
        // récupérer la colonne JSON
        const jsonString = Object.values(result.recordset[0])[0];

        // transformer en objet JSON
        const operations = JSON.parse(jsonString);

        return operations;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    getAllDecaissementAj
};