const { connectDB } = require('../../../config/db');
const sql = require('mssql');
const { operationQueries } = require('../queries/queryIndex');

async function journalPaiement(datedebut, datefin, caisse){
    const pool = await connectDB();

    try {
        const result = await pool.request()
            .input('datedebut', sql.Date, datedebut || null)
            .input('datefin', sql.Date, datefin || null)
            .input('idcaisse', sql.UniqueIdentifier, caisse || null)
            .query(operationQueries.journalpaiement);

        const resultat = result.recordset;
        const map = new Map();
        resultat.forEach(r => {

            const date = r.date_operation.toISOString().split('T')[0];
            const caisseKey = r.caisse;

            // Niveau DATE
            if (!map.has(date)) {
                map.set(date, {
                    date,
                    caisses: new Map()
                });
            }

            const dateGroup = map.get(date);

            // Niveau CAISSE
            if (!dateGroup.caisses.has(caisseKey)) {
                dateGroup.caisses.set(caisseKey, {
                    codecaisse: r.codecaisse,
                    caisse: r.caisse,
                    devise: r.devise_caisse,
                    solde_ouverture: r.solde_ouverture,
                    solde_fermeture: r.solde_fermeture,
                    operations: []
                });
            }

            // Ajout opération
            dateGroup.caisses.get(caisseKey).operations.push({
                typeoperation: r.typeoperation,
                piece: r.operation,
                montant: r.montant,
                montant_ref: r.montant_ref
            });

        });

        // Conversion Map → Array
        const datasql = Array.from(map.values()).map(d => ({
            date: d.date,
            caisses: Array.from(d.caisses.values())
        }));

        return { success: true, data: datasql };
    } catch (error) {
        console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        throw error;
    }
}

function extraireDate(value) {
  return (typeof value === 'string' && value.includes('T'))
    ? value.split('T')[0]
    : null;
}

async function detailOperation(data){
    const pool = await connectDB();

    try {
        const result = await pool.request()
        .input('datedebut', sql.Date, data.datedebut || null)
        .input('datefin', sql.Date, data.datefin || null)
        .input('idcentre', sql.UniqueIdentifier, data.centre || null)
        .input('idnature', sql.UniqueIdentifier, data.nature || null)
        .input('idtiers', sql.UniqueIdentifier, data.tiers || null)
        .input('codeoperation', sql.VarChar(50), data.numero || null)
        .input('montantmin', sql.Decimal(22,9), data.montantmin || null)
        .input('montantmax', sql.Decimal(22,9), data.montantmax || null)
        .query(operationQueries.detailoperation);

        const resultat = result.recordset;

        return resultat;
    } catch (error) {
        console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        throw error;
    }
}

module.exports = {
    journalPaiement,
    detailOperation
};