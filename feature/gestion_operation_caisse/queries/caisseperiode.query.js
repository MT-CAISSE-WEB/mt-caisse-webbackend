module.exports = {
    getAll : `
        SELECT cp.*, 
            c.idcaisse AS caisse_idcaisse,
            c.codecaisse AS caisse_codecaisse,
            c.libelle AS caisse_libelle,
            c.idjournal AS caisse_idjournal,
            c.iddevise AS caisse_iddevise,
			d.codedevise AS devise_code,
            d.intitule AS devise_lib,
            c.idsite AS caisse_idsite,
            c.idsociete AS caisse_idsociete,
            c.idcompte AS caisse_idcompte,
            c.actif AS caisse_actif,
            c.createdat AS caisse_createdat,
            c.createdby AS caisse_createdby
        FROM caisseperiode cp
        LEFT JOIN caisse c ON c.idcaisse = cp.idcaisse
        LEFT JOIN devise d ON d.iddevise = c.iddevise

        ORDER BY cp.date_ouverture DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY;

        SELECT COUNT(*) AS total FROM CaissePeriode;
    `,
    getById : `
        SELECT * FROM CaissePeriode WHERE idperiode = @idperiode
    `,
    INSERT : `
        INSERT INTO CaissePeriode(idperiode, idcaisse, dateperiode, soldeouverture, soldefermeture,
            montantphysique, ecart, statut, createdat, createdby) OUTPUT INSERTED.*
        VALUES(@idperiode, @idcaisse, @dateperiode, @soldeouverture, @soldefermeture, @montantphysique,
         @ecart, @statut, @createdat, @createdby)
    `,
    UPDATE : `
    UPDATE CaissePeriode SET 
            idcaisse = @idcaisse,
            dateperiode = @dateperiode,
            soldeouverture = @soldeouverture,
            soldefermeture = @soldefermeture,
            montantphysique = @montantphysique,
            ecart = @ecart,
            statut = @statut,
            updatedat = @updatedat,
            updatedby = @updatedby
        OUTPUT INSERTED.* WHERE idperiode = @idperiode
    `,
    CLOSE_PERIODE: `
        UPDATE CaissePeriode
        SET 
            soldefermeture = @soldefermeture,
            montantphysique = @montantphysique,
            ecart = @ecart,
            statut = @statut
        OUTPUT INSERTED.* WHERE idperiode = @idperiode
    `,
    DELETE : `
        DELETE FROM CaissePeriode WHERE idperiode = @idperiode
    `,
    VALIDATE_PERIODE: `
        UPDATE CaissePeriode
        SET 
            montantphysique = @montantphysique,
            ecart = @ecart,
            statut = @statut,
            validatedat = @validatedat,
            validatedby = @validatedby
        WHERE idperiode = @idperiode
    `,
    GET_PERIODE_BY_DATE: `
        SELECT *
        FROM CaissePeriode
        WHERE idcaisse = @idcaisse
        AND dateperiode = @dateperiode
    `,
    GET_STATUT_PERIODE: `
        SELECT TOP 1 *
        FROM CaissePeriode
        WHERE idcaisse = @idcaisse
        AND statut = @statut
        ORDER BY dateperiode DESC
    `,
    UPDATE_OPERATION_PERIODE: `
        UPDATE TypeOperation
        SET idperiode = @idperiode
        WHERE idtypeoperation = @idtypeoperation
    `,
    CREATE_NEXT_DAY_PERIODE: `
        INSERT INTO CaissePeriode(
            idperiode, idcaisse, dateperiode, soldeouverture, soldefermeture,
            montantphysique, ecart, statut, createdat, createdby)
        VALUES(
            @idperiode, @idcaisse, DATEADD(day,1,@dateperiode), @soldeouverture, @soldefermeture, @montantphysique,
            @ecart, @statut, @createdat, @createdby )
    `,
    GET_HISTORY: `
        SELECT *
        FROM CaissePeriode
        WHERE idcaisse = @idcaisse
        ORDER BY dateperiode DESC
    `,
    CHECK_IS_OPEN: `
        SELECT statut
        FROM CaissePeriode
        WHERE idperiode = @idperiode
    `,
    CHECK_IS_CLOSED: `
        SELECT statut
        FROM CaissePeriode
        WHERE idperiode = @idperiode
            AND statut = 'ferme'
    `,
    CHECK_IS_VALIDATED: `
        SELECT statut
        FROM CaissePeriode
        WHERE idperiode = @idperiode
          AND statut = 'VALIDE'
    `,
    RECENT_PERIODE : `
        SELECT TOP 1 *
        FROM CaissePeriode
        WHERE idcaisse = @idcaisse
        ORDER BY dateperiode DESC;
    `,
    INSERTBILLET : `
        INSERT INTO caisseBilletage(idbilletage, idperiode, valeur, quantite, montant,
        ecart, createdat, createdby) OUTPUT INSERTED.*
        VALUES(@idbilletage, @idperiode, @valeur, @quantite, @montant, @ecart, @createdat, @createdby)
    `,
}