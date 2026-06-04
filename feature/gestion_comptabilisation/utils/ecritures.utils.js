const {db, sql, connectInstance, connectDB} = require('../../../config/db');

async function generatePieceNumber(transaction, journalCode) {
    
    const today = new Date();

    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    const dateStr = `${dd}-${mm}-${yyyy}`;

    // Récupérer dernier numéro
    const result = await transaction.request()
        .input("journal", sql.NVarChar, journalCode)
        .input("date", sql.NVarChar, dateStr)
        .query(`
            SELECT MAX(sequence) as lastSeq
            FROM PieceComptableSequence WITH (UPDLOCK, HOLDLOCK)
            WHERE journal = @journal AND datepiece = @date
        `);

    let nextSeq = 1;

    if (result.recordset[0].lastSeq !== null) {
        nextSeq = result.recordset[0].lastSeq + 1;
    }

    // Sauvegarder la nouvelle séquence
    await transaction.request()
        .input("journal", sql.NVarChar, journalCode)
        .input("date", sql.NVarChar, dateStr)
        .input("sequence", sql.Int, nextSeq)
        .query(`
            INSERT INTO PieceComptableSequence (journal, datepiece, sequence)
            VALUES (@journal, @date, @sequence)
        `);

    const seqStr = String(nextSeq).padStart(6, '0');

    return `${journalCode}-${dateStr}-${seqStr}`;
}

module.exports = {
    generatePieceNumber
}