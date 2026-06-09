module.exports = {
    journalpaiement : `
        SELECT
            C.codecaisse AS codecaisse,
            C.libelle            AS caisse,
            DC.codedevise        AS devise_caisse,
            L.libelle            AS libelle_op,
            TOPE.montant               AS montant,
            D.codedevise               AS devise_operation,
            TOPE.montantref            AS montant_ref,
            TOPE.codtypeoperation      AS typeoperation,
            EOC.codeoperation          AS operation,
            EOC.dateoperation          AS date_operation,
			Soc.codesociete AS codesociete,
			Soc.raisonsociale AS raisonsociale,
            S.codesite,
            S.libelle                  AS site,
            CP.soldeouverture          AS solde_ouverture,
            CP.soldefermeture          AS solde_fermeture
        FROM EnteteOperationCaisse EOC
        INNER JOIN TypeOperation TOPE 
            ON TOPE.idoperation = EOC.idoperation
        OUTER APPLY (
			SELECT TOP 1 libelle
			FROM LigneOperationCaisse L
			WHERE L.idoperation = TOPE.idoperation
		) L
        INNER JOIN Caisse C 
            ON C.idcaisse = TOPE.idcaisse
        INNER JOIN Devise DC 
            ON DC.iddevise = C.iddevise
        INNER JOIN Devise D 
            ON D.iddevise = EOC.iddevise
        INNER JOIN Site S
            ON S.idsite = EOC.idsite
		INNER JOIN Societe Soc
            ON Soc.idsociete = EOC.idsociete
        LEFT JOIN CaissePeriode CP 
            ON CP.idperiode = TOPE.idperiode
        WHERE
            EOC.dateoperation BETWEEN @datedebut AND @datefin
            AND (
                @idcaisse IS NULL 
                OR TOPE.idcaisse = @idcaisse
            )
            -- Sécurité utilisateur
            AND (
                @typeentitesociete = 1
                OR EOC.idsite = @idsite
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
            S.codesite,
            S.libelle                  AS site,
            CAST(O.dateoperation AS DATE) AS date_operation
        FROM EnteteOperationCaisse O
        JOIN Devise D            ON D.iddevise = O.iddevise
        LEFT JOIN Site S ON S.idsite = O.idsite
        LEFT JOIN LigneOperationCaisse L ON L.idoperation = O.idoperation
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

        -- Sécurité utilisateur
        AND (
            @typeentitesociete = 1
            OR O.idsite = @idsite
        )

        ORDER BY O.dateoperation, O.codeoperation;
    `,
    lastoperation : `
        SELECT
            C.codecaisse              AS codecaisse,
            C.libelle                 AS caisse,
			D.codedevise              AS devise_caisse,
            TOPE.montant              AS montant,
            TOPE.montantref           AS montant_ref,
            TOPE.codtypeoperation     AS typeoperation,
            EOC.codeoperation         AS operation,
            EOC.dateoperation         AS date_operation,
            EOC.montant               AS montant_op,
			DE.codedevise             AS devise_operation,
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
                ON D.iddevise = C.iddevise
			INNER JOIN Devise DE 
                ON DE.iddevise = EOC.iddevise
            LEFT JOIN CaissePeriode CP 
                ON CP.idperiode = TOPE.idperiode
            LEFT JOIN LigneOperationCaisse L
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
            DE.codedevise               AS devise_operation,
            L.libelle  AS commentaire,
            CP.soldeouverture          AS solde_ouverture,
            CP.soldefermeture          AS solde_fermeture
        FROM EnteteOperationCaisse EOC
        INNER JOIN TypeOperation TOPE 
            ON TOPE.idoperation = EOC.idoperation
        INNER JOIN Caisse C 
            ON C.idcaisse = TOPE.idcaisse
        INNER JOIN Devise D 
            ON D.iddevise = C.iddevise
        INNER JOIN Devise DE 
            ON DE.iddevise = EOC.iddevise
        LEFT JOIN CaissePeriode CP 
            ON CP.idperiode = TOPE.idperiode
        LEFT JOIN LigneOperationCaisse L
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
            E.iddemande,
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
                    WHEN codtypeoperation <> 'encaissement' THEN t.montantref
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
       
        GROUP BY E.iddemande, E.idoperation, E.dateoperation, t.idperiode, c.idcaisse, c.codecaisse, c.libelle, c.iddevise, d.codedevise, c.seuilmnimal, c.soldeinitialisation;
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
                    WHEN codtypeoperation <> 'encaissement' THEN t.montantref
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
    `,

    editionjournal : `
        SELECT Soc.codesociete, Soc.raisonsociale,
        Site.codesite, Site.libelle as lib_site,
		J.codejournal, J.designation,
        C.codecaisse, C.libelle as lib_caisse,
        TOPE.codtypeoperation      AS typeoperation, OPE.idoperation,
        OPE.codeoperation, OPE.dateoperation,
        NOP.codenature, NOP.libelle as lib_nature,
        CAN.codecentreanalytique AS codecentre, CAN.libelle as lib_centre,
        T.codetiers, T.designation AS nom_tiers,
        OPL.libelle, OPL.montantoperation AS montantligne,  D.codedevise AS devise_caisse,
        OPE.montant AS total_ope, DevO.codedevise,
        CP.soldeouverture, CP.soldefermeture

        FROM EnteteOperationCaisse OPE
        INNER JOIN TypeOperation TOPE ON TOPE.idoperation = OPE.idoperation
        INNER JOIN Caisse C ON TOPE.idcaisse = C.idcaisse
		INNER JOIN Journal J ON C.idjournal = J.idjournal
        INNER JOIN Devise D ON D.iddevise = C.iddevise
        INNER JOIN Devise DevO ON DevO.iddevise = OPE.iddevise
        INNER JOIN Societe Soc ON C.idsociete = Soc.idsociete
        INNER JOIN Site ON Site.idsite = C.idsite
        LEFT JOIN LigneOperationCaisse OPL ON OPE.idoperation = OPL.idoperation
        LEFT JOIN NatureOperation NOP ON NOP.idnature = OPL.idnature
        LEFT JOIN CentreAnalytique CAN ON CAN.idcentreanalytique = OPL.idcentre
        LEFT JOIN Tiers T ON T.idtiers = OPL.idtiers
        LEFT JOIN CaissePeriode CP ON CP.idperiode = TOPE.idperiode

        WHERE OPE.dateoperation BETWEEN @datedebut AND @datefin 
            AND ( @idcaisse IS NULL OR C.idcaisse = @idcaisse )
            -- Sécurité utilisateur
            --AND ( @typeentitesociete = 1 OR OPE.idsite = @idsite )
            AND OPE.idsite = @idsite

        ORDER BY OPE.dateoperation, C.libelle, OPE.codeoperation
    `,
    etatcloture : `
        SELECT 
            cp.idperiode,
            cp.idcaisse,
            so.codesociete,
            so.raisonsociale,
            s.codesite,
            s.libelle AS site_lib,
            c.codecaisse,
            c.libelle AS caisse_libelle,
            d.codedevise,
            cp.dateperiode,
            cp.soldeouverture,
            cp.soldefermeture,
            cp.montantphysique,
            cp.ecart,
            cp.statut,
            cp.validatedat,
            cp.validatedby
        FROM CaissePeriode cp
        INNER JOIN Caisse c ON cp.idcaisse = c.idcaisse
        INNER JOIN Devise d ON c.iddevise = d.iddevise
        INNER JOIN Societe so ON c.idsociete = so.idsociete
        INNER JOIN Site s ON c.idsite = s.idsite
        WHERE 
            (@idcaisse IS NULL OR cp.idcaisse = @idcaisse)
            AND (@datedebut IS NULL OR cp.dateperiode >= @datedebut)
            AND (@datefin IS NULL OR cp.dateperiode <= @datefin)
        ORDER BY cp.dateperiode DESC;
    `
}