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
            statut = @statut,
            validatedat = @validatedat,
            validatedby = @validatedby
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
    CAISSE_PERIODE : `
        SELECT *
        FROM CaissePeriode
        WHERE idcaisse = @idcaisse AND CAST(dateperiode AS DATE) = @dateperiode
        ORDER BY dateperiode DESC;
    `,
    PERIODE_RECALCUL : `
    SELECT *
        FROM CaissePeriode
        WHERE idcaisse = @idcaisse
        AND dateperiode >= @startDate
        AND dateperiode <= @endDate
        ORDER BY dateperiode ASC
    `,
    CAISSE_SOLDE : `
        SELECT
            C.idcaisse,
            C.codecaisse,
            C.libelle,
            CP.dateperiode,
            CP.soldeouverture,
			d.iddevise,
			d.codedevise,
            ISNULL(
                SUM(
                    CASE
                        WHEN TOPE.codtypeoperation = 'encaissement'
                        THEN TOPE.montant
                        ELSE 0
                    END
                ),
                0
            ) AS total_encaissement,
             ISNULL(
                SUM(
                    CASE
                        WHEN TOPE.codtypeoperation = 'encaissement'
                        THEN TOPE.montantref
                        ELSE 0
                    END
                ),
                0
            ) AS total_encaissement_ref,
            ISNULL(
                SUM(
                    CASE
                        WHEN TOPE.codtypeoperation IN
                            ('decaissement','decaissementaj')
                        THEN TOPE.montant
                        ELSE 0
                    END
                ),
                0
            ) AS total_decaissement,
             ISNULL(
                SUM(
                    CASE
                        WHEN TOPE.codtypeoperation IN
                            ('decaissement','decaissementaj')
                        THEN TOPE.montantref
                        ELSE 0
                    END
                ),
                0
            ) AS total_decaissement_ref,
            (
                CP.soldeouverture
                + ISNULL(
                    SUM(
                        CASE
                            WHEN TOPE.codtypeoperation='encaissement'
                            THEN TOPE.montant
                            ELSE 0
                        END
                    ),
                    0
                )
                - ISNULL(
                    SUM(
                        CASE
                            WHEN TOPE.codtypeoperation IN
                                ('decaissement','decaissementaj')
                            THEN TOPE.montant
                            ELSE 0
                        END
                    ),
                    0
                )
            ) AS solde_theorique,
            (
                CP.soldeouverture
                + ISNULL(
                    SUM(
                        CASE
                            WHEN TOPE.codtypeoperation='encaissement'
                            THEN TOPE.montant
                            ELSE 0
                        END
                    ),
                    0
                )
                - ISNULL(
                    SUM(
                        CASE
                            WHEN TOPE.codtypeoperation IN
                                ('decaissement','decaissementaj')
                            THEN TOPE.montant
                            ELSE 0
                        END
                    ),
                    0
                )
            ) AS solde_previsionnel_fermeture

        FROM CaissePeriode CP
        
        INNER JOIN Caisse C
            ON C.idcaisse = CP.idcaisse

		INNER JOIN Devise D
            ON D.iddevise = C.iddevise

        LEFT JOIN TypeOperation TOPE
            ON TOPE.idperiode = CP.idperiode

        WHERE (@startDate IS NULL OR CP.dateperiode >= @startDate)
        AND (@endDate IS NULL OR CP.dateperiode <= @endDate)

        GROUP BY
            C.idcaisse,
            C.codecaisse,
            C.libelle,
            CP.dateperiode,
            CP.soldeouverture,
			d.iddevise,
			d.codedevise

        ORDER BY
            CP.dateperiode;
    `,
    SOLDE_PERIODE : `
        -- 1. Générer la liste des dates distinctes dans l’intervalle
        WITH dates_range AS (
            SELECT DISTINCT dateperiode
            FROM CaissePeriode
            WHERE (@startDate IS NULL OR dateperiode >= @startDate)
            AND (@endDate IS NULL OR dateperiode <= @endDate)
        ),

        -- 2. Toutes les combinaisons (date, caisse)
        combinations AS (
            SELECT 
                d.dateperiode,
                c.idcaisse,
                c.codecaisse,
                c.libelle,
                c.iddevise,
                dev.codedevise
            FROM dates_range d
            CROSS JOIN Caisse c
            INNER JOIN Devise dev ON dev.iddevise = c.iddevise
            WHERE (@idcaisse IS NULL OR c.idcaisse = @idcaisse) 
        ),

        -- 3. Pour chaque caisse, trouver le dernier solde connu avant ou à chaque date
        last_solde AS (
            SELECT 
                c.idcaisse,
                c.dateperiode,
                (
                    SELECT TOP 1 cp.soldeouverture
                    FROM CaissePeriode cp
                    WHERE cp.idcaisse = c.idcaisse
                    AND cp.dateperiode <= c.dateperiode
                    ORDER BY cp.dateperiode DESC
                ) AS soldeouverture
            FROM combinations c
        ),

        -- 4. Agrégation des opérations par (caisse, date)
        operations_agg AS (
            SELECT 
                cp.idcaisse,
                cp.dateperiode,
                SUM(CASE WHEN tope.codtypeoperation = 'encaissement' THEN tope.montant ELSE 0 END) AS total_encaissement,
                SUM(CASE WHEN tope.codtypeoperation = 'encaissement' THEN tope.montantref ELSE 0 END) AS total_encaissement_ref,
                SUM(CASE WHEN tope.codtypeoperation IN ('decaissement','decaissementaj') THEN tope.montant ELSE 0 END) AS total_decaissement,
                SUM(CASE WHEN tope.codtypeoperation IN ('decaissement','decaissementaj') THEN tope.montantref ELSE 0 END) AS total_decaissement_ref
            FROM CaissePeriode cp
            LEFT JOIN TypeOperation tope ON tope.idperiode = cp.idperiode
            WHERE (@startDate IS NULL OR cp.dateperiode >= @startDate)
            AND (@endDate IS NULL OR cp.dateperiode <= @endDate)
            GROUP BY cp.idcaisse, cp.dateperiode
        )

        -- 5. Sélection finale
        SELECT
            comb.idcaisse,
            comb.codecaisse,
            comb.libelle,
            comb.dateperiode,
            ISNULL(ls.soldeouverture, 0) AS soldeouverture,
            comb.iddevise,
            comb.codedevise,
            ISNULL(oa.total_encaissement, 0) AS total_encaissement,
            ISNULL(oa.total_encaissement_ref, 0) AS total_encaissement_ref,
            ISNULL(oa.total_decaissement, 0) AS total_decaissement,
            ISNULL(oa.total_decaissement_ref, 0) AS total_decaissement_ref,
            ISNULL(ls.soldeouverture, 0)
                + ISNULL(oa.total_encaissement, 0)
                - ISNULL(oa.total_decaissement, 0) AS solde_theorique,
            ISNULL(ls.soldeouverture, 0)
                + ISNULL(oa.total_encaissement, 0)
                - ISNULL(oa.total_decaissement, 0) AS solde_previsionnel_fermeture
        FROM combinations comb
        LEFT JOIN last_solde ls ON ls.idcaisse = comb.idcaisse AND ls.dateperiode = comb.dateperiode
        LEFT JOIN operations_agg oa ON oa.idcaisse = comb.idcaisse AND oa.dateperiode = comb.dateperiode
        ORDER BY comb.dateperiode, comb.codecaisse;
    `,
    SOLDE_DATE : `
        WITH last_period AS (
            SELECT 
                idcaisse,
                dateperiode,
                soldeouverture,
                ROW_NUMBER() OVER (PARTITION BY idcaisse ORDER BY dateperiode DESC) AS rn
            FROM CaissePeriode
        ),
        operations_last AS (
            SELECT 
                cp.idcaisse,
                cp.dateperiode,
                SUM(CASE WHEN tope.codtypeoperation = 'encaissement' THEN tope.montant ELSE 0 END) AS total_encaissement,
                SUM(CASE WHEN tope.codtypeoperation IN ('decaissement','decaissementaj') THEN tope.montant ELSE 0 END) AS total_decaissement
            FROM CaissePeriode cp
            LEFT JOIN TypeOperation tope ON tope.idperiode = cp.idperiode
            INNER JOIN last_period lp ON lp.idcaisse = cp.idcaisse AND lp.dateperiode = cp.dateperiode
            GROUP BY cp.idcaisse, cp.dateperiode
        )
        SELECT 
            c.idcaisse,
            c.codecaisse,
            c.libelle,
            d.codedevise,
            ISNULL(lp.soldeouverture, 0) AS soldeouverture,
            lp.dateperiode AS derniere_date_periode,
            ISNULL(ol.total_encaissement, 0) AS total_encaissement,
            ISNULL(ol.total_decaissement, 0) AS total_decaissement,
            ISNULL(lp.soldeouverture, 0) + ISNULL(ol.total_encaissement, 0) - ISNULL(ol.total_decaissement, 0) AS solde_theorique
        FROM Caisse c
        INNER JOIN Devise d ON d.iddevise = c.iddevise
        LEFT JOIN last_period lp ON lp.idcaisse = c.idcaisse AND lp.rn = 1
        LEFT JOIN operations_last ol ON ol.idcaisse = c.idcaisse AND ol.dateperiode = lp.dateperiode
        ORDER BY c.codecaisse;
    `
}