module.exports = {
    getAll : `
        SELECT *
        FROM LigneDemande
        WHERE (@search IS NULL OR libellelignedemande LIKE @search)
        ORDER BY createdat DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

        SELECT COUNT(*) AS total FROM LigneDemande
        WHERE (@search IS NULL OR libellelignedemande LIKE @search);
    `,
    insert : `
        INSERT INTO LigneDemande (
            idlignedemande, iddemande, numligne, libellelignedemande, montantdemande,
            idnature, idbudget, idcentre, idtiers, idsociete, idsite, createdat, createdby
        )
        OUTPUT INSERTED.*
        VALUES ( @idlignedemande, @iddemande, @numligne,
            @libellelignedemande, @montantdemande, @idnature, @idbudget, @idcentre, @idtiers, @idsociete, @idsite, @createdat, @createdby
        )
    `,
    update : `
        UPDATE LigneDemande
        SET libellelignedemande = @libellelignedemande,
            montantdemande = @montantdemande,
            idnature = @idnature,
            idcentre = @idcentre,
            idtiers = @idtiers,
            updatedat = @updatedat,
            updatedby = @updatedby
        OUTPUT INSERTED.*
        WHERE idlignedemande = @idlignedemande
    `,
    delete : `
        DELETE FROM LigneDemande WHERE idlignedemande = @idlignedemande
    `,
    getBydemande : `
        SELECT *
        FROM LigneDemande
        WHERE iddemande = @iddemande
        ORDER BY numligne
    `,
    getOne : `
     SELECT * FROM LigneDemande WHERE idlignedemande = @idlignedemande
    `
}
