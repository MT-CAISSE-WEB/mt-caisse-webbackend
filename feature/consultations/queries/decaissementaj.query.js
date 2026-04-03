module.exports = {
    getall : `
        SELECT
            E.idoperation,
            E.codeoperation,
            E.dateoperation,
            E.montant,

            -- Devise opération
            D.iddevise,
            D.codedevise,
            D.intitule AS devise,

            L.lignesOperation,
            T.typeOperations,
            J.justificatifs

        FROM EnteteOperationCaisse E

        LEFT JOIN Devise D 
            ON D.iddevise = E.iddevise


        -- LIGNES OPERATION
        OUTER APPLY (
            SELECT
                L.idligneoperation,
                L.libelle,
                L.montantoperation,
                L.comptabilise,
                L.numpiececomptable,
                L.datecomptabilisation,

                -- Nature
                N.idnature,
                N.codenature,
                N.libelle AS libellenature,

                -- Centre analytique
                C.idcentreanalytique,
                C.codecentreanalytique,
                C.libelle AS libellecentre,

                -- Tiers
                T.idtiers,
                T.codetiers,
                T.designation AS designationtiers

            FROM ligneoperationCaisse L

            LEFT JOIN NatureOperation N 
                ON N.idnature = L.idnature

            LEFT JOIN CentreAnalytique C
                ON C.idcentreanalytique = L.idcentre

            LEFT JOIN Tiers T
                ON T.idtiers = L.idtiers

            WHERE L.idoperation = E.idoperation

            FOR JSON PATH
        ) L(lignesOperation)


        -- TYPE OPERATION
        OUTER APPLY (
            SELECT
                T.idtypeoperation,
                T.codtypeoperation,
                T.montant,
                T.taux,
                T.montantref,

                -- Caisse
                C.idcaisse,
                C.codecaisse,
                C.libelle AS caisse,

                -- Devise caisse
                DC.iddevise AS iddevisecaisse,
                DC.codedevise,
                DC.intitule AS devisecaisse,

                T.idperiode

            FROM TypeOperation T

            LEFT JOIN Caisse C 
                ON C.idcaisse = T.idcaisse

            LEFT JOIN Devise DC
                ON DC.iddevise = C.iddevise

            WHERE T.idoperation = E.idoperation

            FOR JSON PATH
        ) T(typeOperations)


        -- JUSTIFICATIFS
        OUTER APPLY (
            SELECT
                J.idjustificatifoperation,
                J.codejustificatif,
                J.date,
                J.montantjustificatif,
                J.taux,
                J.commentaire,

                -- Devise justificatif
                DJ.iddevise,
                DJ.codedevise,
                DJ.intitule AS devise,

                (
                    SELECT
                        D.iddetailsjustificatifoperation,

                        -- Nature
                        N.idnature,
                        N.codenature,
                        N.libelle AS libellenature,

                        -- Centre analytique
                        C.idcentreanalytique,
                        C.codecentreanalytique,
                        C.libelle AS libellecentre,

                        -- Tiers
                        T.idtiers,
                        T.codetiers,
                        T.designation AS designationtiers,

                        D.montantdetail,
                        D.montantref

                    FROM DetailsJustificatifOperation D

                    LEFT JOIN NatureOperation N
                        ON N.idnature = D.idnature

                    LEFT JOIN CentreAnalytique C
                        ON C.idcentreanalytique = D.idcentreanalytique

                    LEFT JOIN Tiers T
                        ON T.idtiers = D.idtiers

                    WHERE D.idjustificatif = J.idjustificatifoperation

                    FOR JSON PATH
                ) AS details

            FROM JustificatifOperation J

            LEFT JOIN Devise DJ
                ON DJ.iddevise = J.iddevise

            WHERE J.idoperation = E.idoperation

            FOR JSON PATH
        ) J(justificatifs)


        WHERE
            (@codeoperation IS NULL OR E.codeoperation = @codeoperation)
            AND (@datedebut IS NULL OR E.dateoperation >= @datedebut)
            AND (@datefin IS NULL OR E.dateoperation <= @datefin)

            -- FILTRE IMPORTANT
            AND EXISTS (
                SELECT 1
                FROM TypeOperation TOF
                WHERE TOF.idoperation = E.idoperation
                AND (@typeoperation IS NULL OR TOF.codtypeoperation = @typeoperation)
            )

        FOR JSON PATH;
    `
}