module.exports = {
    getAll: `
        SELECT * FROM TypeOperation
    `,

    getById: `
        SELECT * FROM TypeOperation WHERE idtypeoperation = @idtypeoperation
    `,

    insert: `
        INSERT INTO TypeOperation (idtypeoperation, codtypeoperation, idoperation, idperiode, idsociete, idsite, idcaisse, montant, taux, montantref, createdat, createdby, updatedat, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idtypeoperation, @codtypeoperation, @idoperation, @idperiode, @idsociete, @idsite, @idcaisse, @montant, @taux, @montantref, @createdat, @createdby, @updatedat, @updatedby)
    `,

    update: ` UPDATE TypeOperation
    SET codetypeoperation = @codetypeoperation, 
        idoperation = @idoperation, 
        idperiode = @idperiode, 
        idsociete = @idsociete, 
        idsite = @idsite, 
        idcaisse = @idcaisse, 
        montant = @montant, 
        updatedat = @updatedat, 
        updatedby = @updatedby 
        OUTPUT INSERTED.* 
        WHERE idtypeoperation = @idtypeoperation`,

    delete: `
        DELETE FROM TypeOperation WHERE idtypeoperation = @idtypeoperation
    `,
    solde_calcul: `
        SELECT 
            idcaisse,
            SUM(
                CASE 
                    WHEN codtypeoperation = 'encaissement' THEN montant
                    ELSE -montant
                END
            ) AS solde
        FROM TypeOperation
        GROUP BY idcaisse;
    `
};
