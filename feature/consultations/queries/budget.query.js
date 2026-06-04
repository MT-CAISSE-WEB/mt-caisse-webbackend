module.exports = {
        // OK
    suivibudget : `
        SELECT B.codebudget, B.libelle AS libellebudget, B.typebudget, B.datedebut, B.datefin
        , DEPT.codedept, DEPT.libelle AS libelledept
        , NO.codenature, NO.libelle AS libellenature
        , BDN.montantprevisionsociete AS prevision

        , ISNULL(SUM(CASE 
                WHEN ED.statut IN (0,1) AND ED.decaisse = 0 
                    THEN LD.montantdemande
                    ELSE 0
                END),0) AS preengage

        , ISNULL(SUM(CASE 
                WHEN ED.statut = 2 AND ED.decaisse = 0 
                    THEN LD.montantdemande
                    ELSE 0
                END),0) AS engage

        , ISNULL(SUM(CASE
                WHEN ED.statut = 2 AND ED.decaisse = 1 
                    THEN LD.montantdemande
                    ELSE 0
                END),0) AS realise

        , BDN.montantprevisionsociete - 
            ISNULL(SUM(CASE 
                WHEN ED.statut IN (0,1) AND ED.decaisse = 0 
                THEN LD.montantdemande
                ELSE 0
            END),0) - 
            ISNULL(SUM(CASE 
                WHEN ED.statut = 2 AND ED.decaisse = 0 
                THEN LD.montantdemande
                ELSE 0
            END),0) -
            ISNULL(SUM(CASE
                WHEN ED.statut = 2 AND ED.decaisse = 1 
                THEN LD.montantdemande
                ELSE 0
            END),0) AS solde


            FROM Budget B
                JOIN BudgetDepartementNature BDN ON BDN.idbudget = B.idbudget
                JOIN Departement DEPT ON DEPT.iddepartement = BDN.iddepartement
                JOIN NatureOperation NO ON NO.idnature = BDN.idnature
                LEFT JOIN EnteteDemande ED ON BDN.iddepartement = ED.iddepartement 
                LEFT JOIN LigneDemande LD ON ED.iddemande = LD.iddemande

            WHERE B.actif = 1 AND B.valide = 1
                AND (BDN.idbudget = @idbudget)
                AND (BDN.iddepartement = @iddepartement)
                AND (BDN.idnature = @idnature)


            GROUP BY B.codebudget, B.libelle , B.typebudget
                , B.datedebut, B.datefin
                , DEPT.codedept, DEPT.libelle
                , NO.codenature, NO.libelle
                , BDN.montantprevisionsociete

            ORDER BY B.codebudget
    `,
    // OK
    suiviByFiltre : `
    SELECT
        B.codebudget,
        ED.iddemande,
        ED.codedemande,
        ED.libelledemande AS libelle_demande,
        ED.datedemande,
        D.codedevise,
        DP.libelle AS libelle_dept,
        NO.libelle AS nature,
        LD.montantdemande,
        ED.statut
    FROM EnteteDemande ED
    JOIN LigneDemande LD ON LD.iddemande = ED.iddemande
    LEFT JOIN Budget B ON B.idbudget = LD.idbudget
    LEFT JOIN NatureOperation NO ON NO.idnature = LD.idnature
    LEFT JOIN Devise D ON D.iddevise = ED.iddevise
    LEFT JOIN Departement DP ON DP.iddepartement = ED.iddepartement
    WHERE
        (@datedebut IS NULL OR ED.datedemande >= @datedebut)
        AND (@datefin IS NULL OR ED.datedemande <= @datefin)
        AND (@idbudget IS NULL OR B.idbudget = @idbudget)
        AND (@idnature IS NULL OR NO.idnature = @idnature)
        AND (@iddepartement IS NULL OR DP.iddepartement = @iddepartement)
    ORDER BY ED.datedemande;
    `,
    suivibudgetbyCentre : `
            WITH Conso AS (
                SELECT 
                    ld.idbudget,
                    ld.idcentre,

                    SUM(CASE WHEN ed.statut < 2 AND ed.decaisse = 0 THEN ld.montantref ELSE 0 END) AS preengage,
                    SUM(CASE WHEN ed.statut = 2 AND ed.decaisse = 0 THEN ld.montantref ELSE 0 END) AS engage,
                    SUM(CASE WHEN ed.statut > 2 AND ed.decaisse = 1 THEN ld.montantref ELSE 0 END) AS realise

                FROM LigneDemande ld
                INNER JOIN EnteteDemande ed 
                    ON ed.iddemande = ld.iddemande

                GROUP BY 
                    ld.idbudget,
                    ld.idcentre
            )

            SELECT 
                b.codebudget,
                b.typebudget,
                b.datedebut,
                b.datefin,
                ca.codecentreanalytique,
                ca.libelle AS libellecentre,

                bdn.montantprevisionsociete AS prevision,

                ISNULL(c.preengage, 0) AS preengage,
                ISNULL(c.engage, 0) AS engage,
                ISNULL(c.realise, 0) AS realise,

                bdn.montantprevisionsociete 
                    - ISNULL(c.preengage, 0)
                    - ISNULL(c.engage, 0)
                    - ISNULL(c.realise, 0) AS solde

            FROM BudgetDepartementNature bdn

            LEFT JOIN Conso c 
                ON c.idbudget = bdn.idbudget
                AND c.idcentre = bdn.idcentreanalytique

            LEFT JOIN Budget b ON b.idbudget = bdn.idbudget
            LEFT JOIN CentreAnalytique ca ON ca.idcentreanalytique = bdn.idcentreanalytique

            Where b.actif = 1 AND b.valide = 1
                AND (@idbudget IS NULL OR bdn.idbudget = @idbudget)
                AND (@centre IS NULL OR bdn.idcentreanalytique = @centre)
            
            ORDER BY 
                b.codebudget,
                ca.codecentreanalytique

            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
        
            SELECT COUNT(*) AS total
            FROM BudgetDepartementNature bdn
            LEFT JOIN Budget b ON b.idbudget = bdn.idbudget
            LEFT JOIN CentreAnalytique ca ON ca.idcentreanalytique = bdn.idcentreanalytique
            WHERE 
                b.actif = 1 
                AND b.valide = 1
                AND (@idbudget IS NULL OR bdn.idbudget = @idbudget)
                AND (@centre IS NULL OR bdn.idcentreanalytique = @centre)
    `,
    suivibudgetBynature: `
            WITH Conso AS (
                SELECT 
                    ld.idbudget,
                    ld.idcentre,
                    ld.idnature,
                    ed.iddepartement,

                    SUM(CASE WHEN ed.statut < 2 AND ed.decaisse = 0 THEN ld.montantref ELSE 0 END) AS preengage,
                    SUM(CASE WHEN ed.statut = 2 AND ed.decaisse = 0 THEN ld.montantref ELSE 0 END) AS engage,
                    SUM(CASE WHEN ed.statut > 2 AND ed.decaisse = 1 THEN ld.montantref ELSE 0 END) AS realise

                FROM LigneDemande ld
                INNER JOIN EnteteDemande ed 
                    ON ed.iddemande = ld.iddemande

                GROUP BY 
                    ld.idbudget,
                    ld.idcentre,
                    ld.idnature,
                    ed.iddepartement
            )

            SELECT 
                b.codebudget,
                b.typebudget,
                b.datedebut,
                b.datefin,
                d.codedept,
                d.libelle AS libelledept,
                n.codenature,
                n.libelle AS libellenature,
                ca.codecentreanalytique,
                ca.libelle AS libellecentre,

                bdn.montantprevisionsociete AS prevision,

                ISNULL(c.preengage, 0) AS preengage,
                ISNULL(c.engage, 0) AS engage,
                ISNULL(c.realise, 0) AS realise,

                bdn.montantprevisionsociete 
                    - ISNULL(c.preengage, 0)
                    - ISNULL(c.engage, 0)
                    - ISNULL(c.realise, 0) AS solde

            FROM BudgetDepartementNature bdn

            LEFT JOIN Conso c 
                ON c.idbudget = bdn.idbudget
                --AND c.idcentre = bdn.idcentreanalytique
                AND c.idnature = bdn.idnature
                AND c.iddepartement = bdn.iddepartement

            LEFT JOIN Budget b ON b.idbudget = bdn.idbudget
            LEFT JOIN Departement d ON d.iddepartement = bdn.iddepartement
            LEFT JOIN NatureOperation n ON n.idnature = bdn.idnature
            LEFT JOIN CentreAnalytique ca ON ca.idcentreanalytique = bdn.idcentreanalytique

            WHERE 
                b.actif = 1 
                AND b.valide = 1
                AND (@idbudget IS NULL OR bdn.idbudget = @idbudget)
                AND (@iddepartement IS NULL OR bdn.iddepartement = @iddepartement)
                AND (@idnature IS NULL OR bdn.idnature = @idnature)
                AND (@centre IS NULL OR bdn.idcentreanalytique = @centre)

            ORDER BY 
                b.codebudget,
                d.codedept,
                n.codenature

            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
        
            SELECT COUNT(*) AS total
            FROM BudgetDepartementNature bdn
            LEFT JOIN Budget b ON b.idbudget = bdn.idbudget
            WHERE 
                b.actif = 1 
                AND b.valide = 1
                AND (@idbudget IS NULL OR bdn.idbudget = @idbudget)
                AND (@iddepartement IS NULL OR bdn.iddepartement = @iddepartement)
                AND (@idnature IS NULL OR bdn.idnature = @idnature)
                AND (@centre IS NULL OR bdn.idcentreanalytique = @centre)
    `,
}