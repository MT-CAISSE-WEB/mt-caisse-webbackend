module.exports = {
    journalpaiement : `
        SELECT
            C.codecaisse AS codecaisse,
            C.libelle            AS caisse,
            TOPE.montant               AS montant,
            D.codedevise               AS devise_caisse,
            TOPE.montantref            AS montant_ref,
            TOPE.codtypeoperation      AS typeoperation,
            EOC.codeoperation          AS operation,
            EOC.dateoperation          AS date_operation,
            CP.soldeouverture          AS solde_ouverture,
            CP.soldefermeture          AS solde_fermeture
        FROM EnteteOperationCaisse EOC
        INNER JOIN TypeOperation TOPE 
            ON TOPE.idoperation = EOC.idoperation
        INNER JOIN Caisse C 
            ON C.idcaisse = TOPE.idcaisse
        INNER JOIN Devise D 
            ON D.iddevise = EOC.iddevise
        LEFT JOIN CaissePeriode CP 
            ON CP.idperiode = TOPE.idperiode
        WHERE
            EOC.dateoperation BETWEEN @datedebut AND @datefin
            AND (
                @idcaisse IS NULL 
                OR TOPE.idcaisse = @idcaisse
            )
        ORDER BY
            C.libelle,
            EOC.dateoperation;
    `,
    detailoperation : `
        SELECT
            NA.idnature        AS idnature,
            NA.libelle          AS nature_operation,
            CA.idcentreanalytique          AS centre_analytique,
            CA.libelle          AS centrelibelle,
            L.idtiers           AS idtiers,
            T.designation          AS tiers,
            L.idcentre  AS idcentre,
            L.montantoperation  AS montantligne,
            D.codedevise       AS devise,
            O.codeoperation    AS piece,
            CAST(O.dateoperation AS DATE) AS date_operation
        FROM EnteteOperationCaisse O
        JOIN Devise D            ON D.iddevise = O.iddevise
        LEFT JOIN ligneoperationCaisse L ON L.idoperation = O.idoperation
        LEFT JOIN NatureOperation NA ON NA.idnature = L.idnature
        LEFT JOIN CentreAnalytique CA ON CA.idcentreanalytique = L.idcentre
        LEFT JOIN Tiers T ON T.idtiers = L.idtiers

        WHERE
            --Filtre dates
            (@datedebut IS NULL OR O.dateoperation >= @datedebut)
        AND (@datefin   IS NULL OR O.dateoperation <= @datefin)

            -- Centre analytique
        AND (@idcentre IS NULL OR CA.idcentreanalytique = @idcentre)

            -- Nature opération
        AND (@idnature IS NULL OR L.idnature = @idnature)

            -- Tiers
        AND (@idtiers IS NULL OR L.idtiers = @idtiers)

            -- Code opération (recherche partielle possible)
        AND (@codeoperation IS NULL OR O.codeoperation LIKE '%' + @codeoperation + '%')

            -- Intervalle montant
        AND (@montantmin IS NULL OR L.montantoperation >= @montantmin)
        AND (@montantmax IS NULL OR L.montantoperation <= @montantmax)

        ORDER BY O.dateoperation, O.codeoperation;
    `,
    lastoperation : `
        SELECT
            C.codecaisse              AS codecaisse,
            C.libelle                 AS caisse,
            TOPE.montant              AS montant,
            D.codedevise              AS devise_caisse,
            TOPE.montantref           AS montant_ref,
            TOPE.codtypeoperation     AS typeoperation,
            EOC.codeoperation         AS operation,
            EOC.dateoperation         AS date_operation,
            EOC.montant               AS montant_op,
            L.libelle                 AS commentaire,
            CP.soldeouverture         AS solde_ouverture,
            CP.soldefermeture         AS solde_fermeture,

            COUNT(*) OVER()           AS total

            FROM EnteteOperationCaisse EOC
            INNER JOIN TypeOperation TOPE 
                ON TOPE.idoperation = EOC.idoperation
            INNER JOIN Caisse C 
                ON C.idcaisse = TOPE.idcaisse
            INNER JOIN Devise D 
                ON D.iddevise = EOC.iddevise
            LEFT JOIN CaissePeriode CP 
                ON CP.idperiode = TOPE.idperiode
            LEFT JOIN LigneoperationCaisse L
                ON L.idoperation = EOC.idoperation
            WHERE
                EOC.dateoperation <= @date
                AND TOPE.idcaisse IN (SELECT value FROM STRING_SPLIT(@caisses, ','))
            ORDER BY
                EOC.dateoperation DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY;
    `,
    history : `
        SELECT
            C.codecaisse AS codecaisse,
            C.libelle            AS caisse,
            TOPE.montant               AS montant,
            D.codedevise               AS devise_caisse,
            TOPE.montantref            AS montant_ref,
            TOPE.codtypeoperation      AS typeoperation,
            EOC.codeoperation          AS operation,
            EOC.dateoperation          AS date_operation,
            EOC.montant          AS montant_op,
            L.libelle  AS commentaire,
            CP.soldeouverture          AS solde_ouverture,
            CP.soldefermeture          AS solde_fermeture
        FROM EnteteOperationCaisse EOC
        INNER JOIN TypeOperation TOPE 
            ON TOPE.idoperation = EOC.idoperation
        INNER JOIN Caisse C 
            ON C.idcaisse = TOPE.idcaisse
        INNER JOIN Devise D 
            ON D.iddevise = EOC.iddevise
        LEFT JOIN CaissePeriode CP 
            ON CP.idperiode = TOPE.idperiode
        LEFT JOIN LigneoperationCaisse L
            ON L.idoperation = EOC.idoperation
        WHERE
            EOC.dateoperation = @date
            AND TOPE.idcaisse IN (
                SELECT value FROM STRING_SPLIT(@caisses, ',')
            )
        ORDER BY
            EOC.dateoperation;
    `,
    totalOperation : `
        SELECT 
            E.idoperation,
            E.dateoperation,
			t.idperiode,
            c.idcaisse,
            c.codecaisse,
            c.libelle,
            c.iddevise,
            d.codedevise,
            c.seuilmnimal,
			c.soldeinitialisation,
            SUM(
                CASE 
                    WHEN codtypeoperation = 'encaissement' THEN t.montantref
                END
            ) AS encaissement,
            SUM(
                CASE 
                    WHEN codtypeoperation = 'decaissement' THEN t.montantref
                END
            ) AS decaissement,
            SUM(
                CASE 
                    WHEN codtypeoperation = 'encaissement' THEN t.montantref
                    ELSE -t.montantref
                END
            ) AS solde
        FROM TypeOperation t 
		LEFT JOIN EnteteOperationCaisse E ON E.idoperation = t.idoperation
        LEFT JOIN Caisse c ON c.idcaisse = t.idcaisse
        LEFT JOIN Devise d ON d.iddevise = c.iddevise
       
        GROUP BY E.idoperation, E.dateoperation, t.idperiode, c.idcaisse, c.codecaisse, c.libelle, c.iddevise, d.codedevise, c.seuilmnimal, c.soldeinitialisation;
    `,
    totalOperationJour : `
        SELECT 
            E.idoperation,
            E.dateoperation,
			t.idperiode,
            c.idcaisse,
            c.codecaisse,
            c.libelle,
            c.iddevise,
            d.codedevise,
            c.seuilmnimal,
			c.soldeinitialisation,
            SUM(
                CASE 
                    WHEN codtypeoperation = 'encaissement' THEN t.montantref
                END
            ) AS encaissement,
            SUM(
                CASE 
                    WHEN codtypeoperation = 'decaissement' THEN t.montantref
                END
            ) AS decaissement,
            SUM(
                CASE 
                    WHEN codtypeoperation = 'encaissement' THEN t.montantref
                    ELSE -t.montantref
                END
            ) AS solde
        FROM TypeOperation t 
		LEFT JOIN EnteteOperationCaisse E ON E.idoperation = t.idoperation
        LEFT JOIN Caisse c ON c.idcaisse = t.idcaisse
        LEFT JOIN Devise d ON d.iddevise = c.iddevise

        E.dateoperation = @date
            AND c.idcaisse IN (
                SELECT value FROM STRING_SPLIT(@caisses, ',')
            )
       
        GROUP BY E.idoperation, E.dateoperation, t.idperiode, c.idcaisse, c.codecaisse, c.libelle, c.iddevise, d.codedevise, c.seuilmnimal, c.soldeinitialisation;
    `
}