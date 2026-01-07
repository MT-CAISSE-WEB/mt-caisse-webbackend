module.exports = {
        // OK
    suivibudget : `
        SELECT
            B.idbudget,
            B.codebudget,
            B.libelle AS libellebudget,
            B.typebudget,
            B.datedebut,
            B.datefin,

            NO.codenature,
            NO.libelle AS nature,

            BDN.montantprevisionsociete AS budget_prevu,

            ISNULL(SUM(CASE 
                WHEN ED.statut IN (0,1) THEN LD.montantdemande
                ELSE 0
            END),0) AS montant_preengage,

            ISNULL(SUM(CASE 
                WHEN ED.statut = 2 THEN LD.montantdemande
                ELSE 0
            END),0) AS montant_engage,

            BDN.montantprevisionsociete
            - ISNULL(SUM(LD.montantdemande),0) AS solde

        FROM Budget B
        JOIN BudgetDepartementNature BDN ON BDN.idbudget = B.idbudget
        JOIN NatureOperation NO ON NO.idnature = BDN.idnature

        LEFT JOIN LigneDemande LD ON LD.idbudget = B.idbudget
        LEFT JOIN EnteteDemande ED 
            ON ED.iddemande = LD.iddemande
            AND ED.statut < 3 -- annulé

        WHERE
            B.actif = 1
            AND B.valide = 1
        GROUP BY
            B.idbudget, B.codebudget, B.libelle, B.typebudget,
            B.datedebut, B.datefin,
            NO.codenature, NO.libelle,
            BDN.montantprevisionsociete
        ORDER BY
            B.datedebut, B.codebudget;

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
        AND (@idnature IS NULL OR NO.idnature = @idnature)
        AND (@iddepartement IS NULL OR DP.iddepartement = @iddepartement)
    ORDER BY ED.datedemande;
    `
}