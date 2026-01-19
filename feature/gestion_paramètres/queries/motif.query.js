module.exports = {
    insert : `
        INSERT INTO Motif (idmotif, codemotif, libellemotif, createdby )
        VALUES (@idmotif, @codemotif, @libellemotif, @createdby) ;
    `,
    getall : `
        SELECT *
            FROM Motif M
            WHERE 1 = 1
                AND (
                    @search IS NULL OR 
                    M.codemotif LIKE @search OR 
                    M.libellemotif LIKE @search
                )
            ORDER BY createdat DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY

            SELECT COUNT(*) AS total FROM Motif M
            WHERE 1 = 1
                AND (
                    @search IS NULL OR 
                    M.codemotif LIKE @search OR 
                    M.libellemotif LIKE @search
                )
    `,
    getone : `SELECT * FROM Motif WHERE idmotif = @idmotif; `,
    update : `
        UPDATE Motif SET
            libellemotif  = @libellemotif,
            updatedat     = GETDATE(),
            updatedby     = @updatedby
        WHERE idmotif = @idmotif;
    `,
    delete : `DELETE FROM Motif WHERE idmotif = @idmotif; `
}