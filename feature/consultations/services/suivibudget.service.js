const { budgetQueries } = require('../queries/queryIndex');
const { connectDB } = require('../../../config/db');
const sql = require('mssql');
const PaginationModel = require('../../../shared/utils/model');

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
        throw error;
    }
}

async function evolutionBudgetaireBynature (data) {
    const pool = await connectDB();

    const page = parseInt(data.page) || 1;
    const limit = parseInt(data.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const result = await pool.request()
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, limit)
        .input('idbudget', sql.UniqueIdentifier, data.idbudget || null)
        .input('iddepartement', sql.UniqueIdentifier, data.iddepartement || null)
        .input('idnature', sql.UniqueIdentifier, data.idnature || null)
        .input('centre', sql.UniqueIdentifier, data.centre || null)
        .query(budgetQueries.suivibudgetBynature);

        const dataRows = result.recordsets[0];            // données paginées
        const totalRows = result.recordsets[1][0].total;  // total

        return new PaginationModel(page, limit, totalRows, dataRows);
    } catch (error) {
        throw error;
    }
}

async function evolutionBudgetaireBycentre (data) {
    const pool = await connectDB();

    const page = parseInt(data.page) || 1;
    const limit = parseInt(data.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const result = await pool.request()
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, limit)
        .input('idbudget', sql.UniqueIdentifier, data.idbudget || null)
        .input('centre', sql.UniqueIdentifier, data.centre || null)
        .query(budgetQueries.suivibudgetbyCentre);

        const dataRows = result.recordsets[0];            // données paginées
        const totalRows = result.recordsets[1][0].total;  // total

        return new PaginationModel(page, limit, totalRows, dataRows);
    } catch (error) {
        throw error;
    }
}




module.exports = {
    suivibudget,
    suiviByFiltre,
    evolutionBudgetaireBycentre,
    evolutionBudgetaireBynature
};