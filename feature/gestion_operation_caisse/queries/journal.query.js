module.exports = {
    getAll: `
        SELECT *
        FROM Journal j
        WHERE 1 = 1
            AND (
                @search IS NULL OR 
                j.codejournal LIKE @search OR 
                j.designation LIKE @search
            ) AND (@actif IS NULL OR actif = @actif)
        ORDER BY createdat DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY

        SELECT COUNT(*) AS total FROM Journal j
        WHERE 1 = 1
            AND (
                @search IS NULL OR 
                j.codejournal LIKE @search OR 
                j.designation LIKE @search
            ) AND (@actif IS NULL OR actif = @actif)
    `,

    getById: `
        SELECT * FROM Journal WHERE idjournal = @idjournal
    `,

    insert: `
        INSERT INTO Caisse(
            idcaisse, codecaisse, libelle, idjournal, iddevise, idsite,
            idsociete, idcompte, dateinitialisation, soldeinitialisation, seuilmnimal, actif, createdat, createdby
        ) OUTPUT INSERTED.*
        VALUES(
            @idcaisse, @codecaisse, @libelle, @idjournal, @iddevise, @idsite,
            @idsociete, @idcompte, @dateinitialisation, @soldeinitialisation, @seuilmnimal, @actif, @createdat, @createdby
        )
    `,

    update: `
        UPDATE Caisse SET 
            codecaisse = @codecaisse,
            libelle = @libelle,
            idjournal = @idjournal,
            iddevise = @iddevise,
            idsite = @idsite,
            idsociete = @idsociete,
            idcompte = @idcompte,
            dateinitialisation = @dateinitialisation,
            soldeinitialisation = @soldeinitialisation,
            seuilmnimal = @seuilmnimal,
            actif = @actif,
            updatedat = @updatedat,
            updatedby = @updatedby
        OUTPUT INSERTED.* WHERE codecaisse = @codecaisse
    `,

    delete: `
        DELETE FROM Caisse WHERE idcaisse = @idcaisse
    `
};
