const { budgetQueries } = require('../queries/queryIndex');
const { connectDB } = require('../../../config/db');
const sql = require('mssql');

async function suivibudget (data) {
    const pool = await connectDB();

    try {
        const result = await pool.request()
        .input('idbudget', sql.UniqueIdentifier, data.idbudget || null)
        .input('iddepartement', sql.UniqueIdentifier, data.iddepartement || null)
        .input('idnature', sql.UniqueIdentifier, data.idnature || null)
        .query(budgetQueries.suivibudget);

        const resultat = result.recordset;

        return {success: true, data: resultat};
    } catch (error) {
        console.log(`Erreur de recuperation: ${error}`.cyan.bold);
    }
}


async function suiviByFiltre(datedebut, datefin, budget, nature, departement) {
    const pool = await connectDB();
    try {
        const result = await pool.request()
            // .input('idbudget', sql.UniqueIdentifier, budget)
            .input('datedebut', sql.Date, datedebut || null)
            .input('datefin', sql.Date, datefin || null)
            .input('idbudget', sql.UniqueIdentifier, budget || null)
            .input('idnature', sql.UniqueIdentifier, nature || null)
            .input('iddepartement', sql.UniqueIdentifier, departement || null)
            .query(budgetQueries.suiviByFiltre);


        return { success: true, data: result.recordsets[0] };
    } catch (error) {
        console.log(`Erreur de récupération : ${error}`.cyan.bold);
        throw error;
    }
}




module.exports = {
    suivibudget,
    suiviByFiltre
};