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
    `
}