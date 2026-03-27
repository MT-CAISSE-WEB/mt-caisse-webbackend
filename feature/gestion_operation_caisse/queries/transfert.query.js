module.exports = {
    INSERT: `
        INSERT INTO Transfertfond (
            codetransfert,
            typesource,
            idsourcebanque,
            idsourcecaisse,
            typedestination,
            iddestination,
            taux,
            montant,
            montantref,
            datetransfert,
            description,
            statut,
            createdby
        )
        VALUES (
            @codetransfert,
            @typesource, -- 'BANQUE' ou 'CAISSE'
            @idsourcebanque, -- NULL si caisse
            @idsourcecaisse, -- NULL si banque
            @typedestination,
            @iddestination,
            @taux,
            @montant,
            @montantref,
            @datetransfert,
            @description,
            @statut,
            @createdby
        );
    `,
    GETALL : `
        SELECT 
            TF.idtransfert,
            TF.codetransfert,
            TF.typesource,

            -- SOURCE LIBELLE
            CASE 
                WHEN TF.typesource = 'BANQUE' THEN B.libelle
                WHEN TF.typesource = 'CAISSE' THEN Csrc.libelle
            END AS source_libelle,

            TF.typedestination,
            Cdest.libelle AS destination_libelle,

            TF.montant,
            TF.montantref,
            TF.taux,
            TF.datetransfert,
            TF.statut,
            TF.description,
            TF.createdat

        FROM Transfertfond TF

        LEFT JOIN banque B 
            ON TF.idsourcebanque = B.idbanque

        LEFT JOIN Caisse Csrc 
            ON TF.idsourcecaisse = Csrc.idcaisse

        INNER JOIN Caisse Cdest 
            ON TF.iddestination = Cdest.idcaisse

        ORDER BY TF.datetransfert DESC;
    `,
    UPDATE : `
        UPDATE Transfertfond
            SET 
                codetransfert = @codetransfert,
                typesource = @typesource,
                idsourcebanque = @idsourcebanque,
                idsourcecaisse = @idsourcecaisse,
                iddestination = @iddestination,
                taux = @taux,
                montant = @montant,
                montantref = @montantref,
                datetransfert = @datetransfert,
                description = @description,
                updatedat = GETDATE(),
                updatedby = @updatedby
            WHERE idtransfert = @idtransfert
            AND statut = 0; -- sécurité
    `,
    DELETE : ``
}