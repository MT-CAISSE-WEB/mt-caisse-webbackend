module.exports = {
    demandeByuser : `
        WITH Data AS (
            SELECT 
                ED.iddemande
            FROM EnteteDemande ED
            WHERE ED.iddemandeur = @idutilisateur
        )

        SELECT 
            ED.iddemande,
            ED.codedemande,
            ED.typedemande,
            ED.libelledemande,
            ED.datedemande,
            ED.decaisse,
            ED.niveauactuel,
            ED.statut,

            S.idsite,
            S.codesite,
            S.libelle AS site,

            DV.codedevise,
            DV.intitule AS devise,

            LD.idlignedemande,

            N.codenature,
            N.libelle AS nature_operation,

            CA.codecentreanalytique,
            CA.libelle AS centre_analytique,

            T.codetiers,
            T.designation AS tiers,

            LD.montantdemande,

            U.codeutilisateur,
            U.nom,
            U.prenom

        FROM Data DT

        INNER JOIN EnteteDemande ED 
            ON ED.iddemande = DT.iddemande

        INNER JOIN LigneDemande LD 
            ON LD.iddemande = ED.iddemande

        LEFT JOIN NatureOperation N 
            ON N.idnature = LD.idnature

        LEFT JOIN CentreAnalytique CA 
            ON CA.idcentreanalytique = LD.idcentre

        LEFT JOIN Tiers T 
            ON T.idtiers = LD.idtiers

        LEFT JOIN Devise DV 
            ON DV.iddevise = ED.iddevise

        LEFT JOIN Site S 
            ON S.idsite = ED.idsite

        LEFT JOIN Utilisateur U 
            ON U.idutilisateur = ED.iddemandeur

        ORDER BY ED.datedemande DESC

        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

        -- TOTAL
        SELECT COUNT(*) AS total
        FROM EnteteDemande ED
        WHERE ED.iddemandeur = @idutilisateur
    `,
    consultationRequest : `
        WITH Data AS (
            SELECT 
                ED.iddemande,
                ED.codedemande,
                ED.typedemande,
                ED.libelledemande,
                ED.datedemande,

                S.idsite,
                S.codesite,
                S.libelle AS site,

                D.codedevise,
                D.intitule AS devise,

                N.codenature,
                N.libelle AS nature_operation,

                CA.codecentreanalytique,
                CA.libelle AS centre_analytique,

                T.codetiers,
                T.designation AS tiers,

                LD.montantdemande,

                U.codeutilisateur,
                U.nom,
                U.prenom

            FROM LigneDemande LD

            INNER JOIN EnteteDemande ED 
                ON ED.iddemande = LD.iddemande

            LEFT JOIN NatureOperation N 
                ON N.idnature = LD.idnature

            LEFT JOIN CentreAnalytique CA 
                ON CA.idcentreanalytique = LD.idcentre

            LEFT JOIN Tiers T 
                ON T.idtiers = LD.idtiers

            LEFT JOIN Devise D 
                ON D.iddevise = ED.iddevise
            
            LEFT JOIN Site S 
                ON S.idsite = ED.idsite

            LEFT JOIN Utilisateur U 
                ON U.idutilisateur = ED.iddemandeur

            WHERE 
                (@datedebut IS NULL OR ED.datedemande >= @datedebut)
                AND (@datefin IS NULL OR ED.datedemande <= @datefin)

                AND (@codedemande IS NULL OR ED.codedemande = @codedemande)

                AND (
                    @typeentitesociete = 1
                    OR ED.idsite = @idsite
                )
        )

        SELECT * FROM Data
        ORDER BY datedemande DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

        SELECT COUNT(*) AS total FROM Data;
    `,
    etatbudget : `
        SELECT 
            B.codebudget,
            B.libelle AS budget,

            CA.codecentreanalytique,
            CA.libelle AS centre,

            N.codenature,
            N.libelle AS nature,

            T.codetiers,
            T.designation AS tiers,

            SUM(LD.montantdemande) AS total_demande,
            SUM(LD.preengage) AS total_preengage,
            SUM(LD.engage) AS total_engage,
            SUM(LD.realise) AS total_realise,

            BDN.montantprevisionsociete AS budget_prevu,

            (BDN.montantprevisionsociete 
            - (SUM(LD.preengage) + SUM(LD.engage) + SUM(LD.realise))
            ) AS disponible

        FROM LigneDemande LD

        LEFT JOIN EnteteDemande ED ON ED.iddemande = LD.iddemande
        LEFT JOIN NatureOperation N ON N.idnature = LD.idnature
        LEFT JOIN CentreAnalytique CA ON CA.idcentreanalytique = LD.idcentre
        LEFT JOIN Tiers T ON T.idtiers = LD.idtiers
        LEFT JOIN Budget B ON B.idbudget = LD.idbudget

        LEFT JOIN BudgetDepartementNature BDN 
            ON BDN.idbudget = LD.idbudget 
            AND BDN.idnature = LD.idnature

        WHERE ED.statut = 1 -- validé (exemple)

        GROUP BY 
            B.codebudget,
            B.libelle,
            CA.codecentreanalytique,
            CA.libelle,
            N.codenature,
            N.libelle,
            T.codetiers,
            T.designation,
            BDN.montantprevisionsociete
    `,
    requestConsultation : `
        WITH Data AS (
            SELECT 
                ED.iddemande
            FROM EnteteDemande ED
            WHERE 
                (@datedebut IS NULL OR ED.datedemande >= @datedebut)
                AND (@datefin IS NULL OR ED.datedemande <= @datefin)
                AND (@codedemande IS NULL OR ED.codedemande = @codedemande)
                AND (
                    @typeentitesociete = 1
                    OR ED.idsite = @idsite
                )
        )

        SELECT 
            ED.iddemande,
            ED.codedemande,
            ED.typedemande,
            ED.libelledemande,
            ED.datedemande,
            ED.decaisse,
            ED.statut,

            S.idsite,
            S.codesite,
            S.libelle AS site,

            DV.codedevise,
            DV.intitule AS devise,

            N.codenature,
            N.libelle AS nature_operation,

            CA.codecentreanalytique,
            CA.libelle AS centre_analytique,

            T.codetiers,
            T.designation AS tiers,

            LD.montantdemande,

            U.codeutilisateur,
            U.nom,
            U.prenom

        FROM Data DT

        INNER JOIN EnteteDemande ED 
            ON ED.iddemande = DT.iddemande

        INNER JOIN LigneDemande LD 
            ON LD.iddemande = ED.iddemande

        LEFT JOIN NatureOperation N 
            ON N.idnature = LD.idnature

        LEFT JOIN CentreAnalytique CA 
            ON CA.idcentreanalytique = LD.idcentre

        LEFT JOIN Tiers T 
            ON T.idtiers = LD.idtiers

        LEFT JOIN Devise DV 
            ON DV.iddevise = ED.iddevise

        LEFT JOIN Site S 
            ON S.idsite = ED.idsite

        LEFT JOIN Utilisateur U 
            ON U.idutilisateur = ED.iddemandeur

        ORDER BY ED.datedemande DESC

        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

        -- TOTAL
        SELECT COUNT(*) AS total
        FROM EnteteDemande ED
        WHERE 
            (@datedebut IS NULL OR ED.datedemande >= @datedebut)
            AND (@datefin IS NULL OR ED.datedemande <= @datefin)
            AND (@codedemande IS NULL OR ED.codedemande = @codedemande)
            AND (
                @typeentitesociete = 1
                OR ED.idsite = @idsite
            );
    `
}