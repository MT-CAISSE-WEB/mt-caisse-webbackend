module.exports = {
    insert : `
        INSERT INTO PieceJointe (idpiecejointe, urlpiece, nomtable, idtable, dossier, createdby)
        VALUES (@idpiecejointe, @urlpiece, @nomtable, @idtable, @dossier, @createdby);
    `,
    getall : ` SELECT * FROM PieceJointe ORDER BY createdat DESC; `,
    getone : `SELECT * FROM PieceJointe WHERE idpiecejointe = @idpiecejointe; `,
    update : `
        UPDATE PieceJointe SET
            urlpiece  = @urlpiece,
            nomtable  = @nomtable,
            idtable  = @idtable,
            dossier  = @dossier,
            updatedat     = GETDATE(),
            updatedby     = @updatedby
        WHERE idpiecejointe = @idpiecejointe;
    `,
    delete : `DELETE FROM PieceJointe WHERE idpiecejointe = @idpiecejointe; `
}