const { budgetQueries } = require('../queries/queryIndex');
const { connectDB } = require('../../../config/db');
const sql = require('mssql');

async function suivibudget () {
        const pool = await connectDB();

        try {
            const result = await pool.request()
            .query(budgetQueries.suivibudget);

            const resultat = result.recordsets[0];

            return {success: true, data: resultat};
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }


async function suiviByFiltre(datedebut, datefin, nature, departement) {
    // console.log(datedebut, datefin, nature, departement);
    const pool = await connectDB();
    try {
        const result = await pool.request()
            // .input('idbudget', sql.UniqueIdentifier, budget)
            .input('datedebut', sql.Date, datedebut || null)
            .input('datefin', sql.Date, datefin || null)
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