module.exports = {
    getAll : `
        SELECT *
        FROM LigneDemande
        WHERE (@search IS NULL OR libellelignedemande LIKE @search)
        ORDER BY createdat DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

        SELECT COUNT(*) AS total FROM LigneDemande
        WHERE (@search IS NULL OR libellelignedemande LIKE @search);
    `,
    insert : `
        INSERT INTO LigneDemande (
            idlignedemande, iddemande, numligne, libellelignedemande, montantdemande, montantref, budgetconso, preengage, engage, realise,
            idnature, idbudget, idcentre, idtiers, idsociete, idsite, createdat, createdby
        )
        OUTPUT INSERTED.*
        VALUES ( @idlignedemande, @iddemande, @numligne, @libellelignedemande, @montantdemande, @montantref, @budgetconso, @preengage, @engage, @realise,
            @idnature, @idbudget, @idcentre, @idtiers, @idsociete, @idsite, @createdat, @createdby
        )
    `,
    update : `
        UPDATE LigneDemande
        SET libellelignedemande = @libellelignedemande,
            montantdemande = @montantdemande,
            montantref = @montantref,
            idnature = @idnature,
            idcentre = @idcentre,
            idtiers = @idtiers,
            updatedat = @updatedat,
            updatedby = @updatedby
        OUTPUT INSERTED.*
        WHERE idlignedemande = @idlignedemande
    `,
    delete : `
        DELETE FROM LigneDemande WHERE idlignedemande = @idlignedemande
    `,
    getBydemande : `
        SELECT *
        FROM LigneDemande
        WHERE iddemande = @iddemande
        ORDER BY numligne
    `,
    getOne : `
     SELECT * FROM LigneDemande WHERE idlignedemande = @idlignedemande
    `,
    resoleveBudget : `
        SELECT B.*
        FROM Budget B
        JOIN BudgetDepartementNature BDN ON B.idbudget = BDN.idbudget
        WHERE 
        BDN.idnature = @idnature
        AND ( BDN.iddepartement = @iddepartement OR BDN.iddepartement IS NULL )
        AND B.actif = 1
		AND B.valide = 1
		AND B.cloture = 0
		AND @datedemande BETWEEN B.datedebut AND B.datefin
        AND (
            (B.typebudget = 'Annuel' AND B.idsociete = @idsociete)
            OR (B.typebudget = 'Mensuel' AND B.idsociete = @idsociete)
        )
    `,
    checkBudgetSolde : `
        SELECT 
        BDN.idbudget, BDN.iddepartement, BDN.idnature, BDN.montantprevisionsociete - ISNULL(SUM(LD.montantdemande),0) AS solde
        FROM BudgetDepartementNature BDN
        LEFT JOIN LigneDemande LD ON LD.idbudget = BDN.idbudget
        LEFT JOIN EnteteDemande ED ON ED.iddemande = LD.iddemande AND ED.statut = 2
        WHERE BDN.idbudget = @idbudget AND BDN.idnature = @idnature
		AND (BDN.iddepartement = @iddepartement OR BDN.iddepartement IS NULL ) 
        GROUP BY BDN.idbudget, BDN.iddepartement, BDN.idnature, BDN.montantprevisionsociete
    `,

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
    suiviBydemande : `
        SELECT
            ED.codedemande,
            ED.datedemande,
            D.codedevise,
            D.intitule AS libelle_dev,
            DP.codedept,
            DP.libelle AS libelle_dept,
            ED.statut,
            LD.numligne,
            NO.libelle AS nature,
            LD.montantdemande,
            B.codebudget
        FROM EnteteDemande ED
        LEFT JOIN LigneDemande LD ON LD.iddemande = ED.iddemande
        LEFT JOIN Budget B ON B.idbudget = LD.idbudget
        LEFT JOIN NatureOperation NO ON NO.idnature = LD.idnature
        LEFT JOIN Devise D ON D.iddevise = ED.iddevise
        LEFT JOIN Departement DP ON DP.iddepartement = ED.iddepartement
        WHERE
            B.idbudget = @idbudget
        ORDER BY ED.datedemande;
    `,
    preengage: `
        Select SUM(LD.montantref) AS preengage
        from EnteteDemande E
            LEFT JOIN LigneDemande LD ON LD.iddemande = E.iddemande
            LEFT JOIN Budget B ON B.idbudget = LD.idbudget
        Where E.statut < 2 AND E.decaisse = 0 
                and LD.idnature = @idnature 
                AND LD.idbudget IS NOT NULL
    `,
    engage : `
        Select SUM(LD.montantref) AS engage
        from EnteteDemande E
            LEFT JOIN LigneDemande LD ON LD.iddemande = E.iddemande
            LEFT JOIN Budget B ON B.idbudget = LD.idbudget
        Where E.statut = 3 AND E.decaisse = 0 
                and LD.idnature = @idnature 
                AND LD.idbudget IS NOT NULL
    `,
    reel : `
        Select SUM(LD.montantref) AS realise
        from EnteteDemande E
            LEFT JOIN LigneDemande LD ON LD.iddemande = E.iddemande
            LEFT JOIN Budget B ON B.idbudget = LD.idbudget
        Where E.statut = 3 AND E.decaisse = 1 
                and LD.idnature = @idnature 
                AND LD.idbudget IS NOT NULL
    `
}
