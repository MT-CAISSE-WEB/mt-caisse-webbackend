module.exports = {
    getAll: `
        SELECT * FROM TypeOperation
    `,

    getById: `
        SELECT * FROM TypeOperation WHERE idtypeoperation = @idtypeoperation
    `,

    insert: `
        INSERT INTO TypeOperation (idtypeoperation, codtypeoperation, idoperation, idperiode, idsociete, idsite, idcaisse, montant, taux, montantref, createdat, createdby, updatedat, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idtypeoperation, @codtypeoperation, @idoperation, @idperiode, @idsociete, @idsite, @idcaisse, @montant, @taux, @montantref, @createdat, @createdby, @updatedat, @updatedby)
    `,

    update: `
        UPDATE TypeOperation 
        SET codtypeoperation = @codtypeoperation, 
        idoperation = @idoperation, 
        idcaisse = @idcaisse, 
        montant = @montant, 
        taux = @taux,
        montantref = @montantref,
        updatedat = @updatedat, 
        updatedby = @updatedby 
        OUTPUT INSERTED.* 
        WHERE idtypeoperation = @idtypeoperation`,

    delete: `
        DELETE FROM TypeOperation WHERE idtypeoperation = @idtypeoperation
    `,
    solde_calcul: `
        SELECT 
            t.idcaisse,
            c.codecaisse,
            c.libelle,
            c.idjournal,
            c.idcompte,
            c.iddevise,
            d.codedevise,
            c.seuilmnimal,
            SUM(
                CASE 
                    WHEN codtypeoperation = 'encaissement' THEN montant
                    ELSE -montant
                END
            ) AS solde
        FROM TypeOperation t
        LEFT JOIN Caisse c ON c.idcaisse = t.idcaisse
        LEFT JOIN Devise d ON d.iddevise = c.iddevise
        GROUP BY t.idcaisse, c.codecaisse, c.libelle, c.idjournal, c.idcompte, c.iddevise, d.codedevise, c.seuilmnimal;
    `,
    solde_caisse_periode: `
        SELECT 
            t.idcaisse,
            c.codecaisse,
            c.libelle,
            c.idjournal,
            c.idcompte,
            c.iddevise,
            c.seuilmnimal,
            SUM(
                CASE 
                    WHEN codtypeoperation = 'encaissement' THEN montant
                    ELSE -montant
                END
            ) AS solde
        FROM TypeOperation t
        LEFT JOIN Caisse c ON c.idcaisse = t.idcaisse
        WHERE t.idperiode = @idperiode
        GROUP BY t.idcaisse, c.codecaisse, c.libelle, c.idjournal, c.idcompte, c.iddevise, c.seuilmnimal;
    `,
    plus_couteux : `
        SELECT TOP 1
            t.idtypeoperation,
            t.codtypeoperation,
            t.idcaisse,
            c.idcaisse,
            c.codecaisse,
            c.libelle,
            c.idjournal,
            c.idcompte,
            c.iddevise,
            t.montantref,
            e.codeoperation,
            e.dateoperation
        FROM TypeOperation t
        JOIN EnteteOperationCaisse e ON e.idoperation = t.idoperation
        LEFT JOIN Caisse c ON c.idcaisse = t.idcaisse
        ORDER BY
            t.montantref DESC;
    `,
    moins_couteux : `
        SELECT TOP 1
            t.idtypeoperation,
            t.codtypeoperation,
            t.idcaisse,
            c.codecaisse,
            c.libelle,
            c.idjournal,
            c.idcompte,
            c.iddevise,
            t.montantref,
            e.codeoperation,
            e.dateoperation
        FROM TypeOperation t
        JOIN EnteteOperationCaisse e ON e.idoperation = t.idoperation
        LEFT JOIN Caisse c ON c.idcaisse = t.idcaisse
        WHERE
            t.codtypeoperation = @codetypeoperation
            AND t.idperiode = @periode
        ORDER BY
            t.montantref ASC;
    `,
    total_caisse : `
        SELECT
            SUM(t.montantref) AS total_decaissement_jour
        FROM TypeOperation t
        JOIN EnteteOperationCaisse e ON e.idoperation = t.idoperation
        WHERE
            t.codtypeoperation = @codetypeoperation
            AND t.idperiode = @periode
    `,
    total_par_caisse : `
        SELECT
            t.idcaisse,
            c.codecaisse,
            c.libelle,
            c.idjournal,
            c.idcompte,
            c.iddevise,
            SUM(t.montantref) AS total_decaissement
        FROM TypeOperation t
        JOIN EnteteOperationCaisse e ON e.idoperation = t.idoperation
        LEFT JOIN Caisse c ON c.idcaisse = t.idcaisse
        WHERE
            t.codtypeoperation = @codetypeoperation
            AND t.idperiode = @periode
        GROUP BY
            t.idcaisse
        ORDER BY
            total_decaissement DESC;
    `,
    operation : `
        SELECT
            t.idtypeoperation,
            t.codtypeoperation,
            t.idcaisse,
            c.iddevise,
			t.idperiode,
			t.montant,
			t.taux,
            t.montantref,
            cp.dateperiode,
            e.codeoperation,
            e.dateoperation
        FROM TypeOperation t
        JOIN EnteteOperationCaisse e ON e.idoperation = t.idoperation
        LEFT JOIN Caisse c ON c.idcaisse = t.idcaisse
        LEFT JOIN CaissePeriode cp ON cp.idperiode = t.idperiode
        ORDER BY
            t.montantref DESC;
    `,
    decaissBydemandeDevRef: `
        SELECT
            ED.iddemande,
            ED.codedemande,

            SUM(TOp.montantref) AS montant_decaisse_ref

        FROM EnteteDemande ED
        JOIN EnteteOperationCaisse EOC 
            ON EOC.iddemande = ED.iddemande
        JOIN TypeOperation TOp 
            ON TOp.idoperation = EOC.idoperation

        GROUP BY
            ED.iddemande,
            ED.codedemande;
    `,
    decaissBydemandeDevCaisse : `
        SELECT
            ED.codedemande,
            C.codecaisse,
            D.codedevise,

            SUM(TOp.montant) AS montant_decaisse_devise,
            SUM(TOp.montantref) AS montant_decaisse_ref

        FROM EnteteDemande ED
        LEFT JOIN EnteteOperationCaisse EOC ON EOC.iddemande = ED.iddemande
        LEFT JOIN TypeOperation TOp ON TOp.idoperation = EOC.idoperation
        LEFT JOIN Caisse C ON C.idcaisse = TOp.idcaisse
        LEFT JOIN Devise D ON D.iddevise = C.iddevise

        WHERE ED.iddemande = @iddemande

        GROUP BY
            ED.codedemande,
            C.codecaisse,
            D.codedevise;

    `,
    decaissBydemandeNature: `
        SELECT
            ED.codedemande,
            NO.codenature,
            NO.libelle AS nature,

            SUM(TOp.montantref) AS montant_decaisse_ref

        FROM EnteteDemande ED
        JOIN EnteteOperationCaisse EOC ON EOC.iddemande = ED.iddemande
        JOIN ligneoperationCaisse LOC ON LOC.idoperation = EOC.idoperation
        JOIN TypeOperation TOp ON TOp.idoperation = EOC.idoperation
        JOIN NatureOperation NO ON NO.idnature = LOC.idnature

        WHERE ED.iddemande = @iddemande

        GROUP BY
            ED.codedemande,
            NO.codenature,
            NO.libelle;

    `,
    decaissBydempandeBudget: `
        SELECT
            ED.codedemande,
            B.codebudget,
            B.libelle AS budget,

            SUM(TOp.montantref) AS montant_decaisse_ref

        FROM EnteteDemande ED
        JOIN EnteteOperationCaisse EOC ON EOC.iddemande = ED.iddemande
        JOIN ligneoperationCaisse LOC ON LOC.idoperation = EOC.idoperation
        JOIN TypeOperation TOp ON TOp.idoperation = EOC.idoperation

        JOIN LigneDemande LD 
            ON LD.iddemande = ED.iddemande
            AND LD.idnature = LOC.idnature

        JOIN Budget B ON B.idbudget = LD.idbudget

        WHERE ED.iddemande = @iddemande

        GROUP BY
            ED.codedemande,
            B.codebudget,
            B.libelle;

    `,
    decaisseBudgetPeriode: `
        SELECT
            B.codebudget,
            FORMAT(EOC.dateoperation, 'yyyy-MM') AS periode,

            SUM(TOp.montantref) AS montant_decaisse_ref

        FROM EnteteOperationCaisse EOC
        JOIN TypeOperation TOp ON TOp.idoperation = EOC.idoperation
        JOIN ligneoperationCaisse LOC ON LOC.idoperation = EOC.idoperation
        JOIN LigneDemande LD ON LD.idnature = LOC.idnature
        JOIN Budget B ON B.idbudget = LD.idbudget

        GROUP BY
            B.codebudget,
            FORMAT(EOC.dateoperation, 'yyyy-MM');

    `,
    reçucaisse : `
        SELECT
            S.raisonsociale        AS societe,
            SI.libelle             AS site,
            C.libelle               AS caisse,
            E.codeoperation         AS numero,
            E.dateoperation,
            D.codedevise            AS deviseoperation,
            DC.codedevise            AS devisecaisse,
            CP.soldeouverture,
            CP.soldefermeture,

            TOPE.codtypeoperation   AS typeoperation,
            N.libelle               AS nature,
            T.designation              AS tiers,
            L.montantoperation      AS montantoperation,
            L.libelle      AS libelleoperation,
            TOPE.montant            AS montantpaye

        FROM EnteteOperationCaisse E
        JOIN TypeOperation TOPE ON TOPE.idoperation = E.idoperation
        JOIN Caisse C ON C.idcaisse = TOPE.idcaisse
        JOIN Societe S ON S.idsociete = E.idsociete
        JOIN Site SI ON SI.idsite = E.idsite
        JOIN Devise DC ON DC.iddevise = C.iddevise
        JOIN Devise D ON D.iddevise = E.iddevise
        JOIN CaissePeriode CP ON CP.idperiode = TOPE.idperiode
        LEFT JOIN ligneoperationCaisse L ON L.idoperation = E.idoperation
        LEFT JOIN NatureOperation N ON N.idnature = L.idnature
        LEFT JOIN Tiers T ON T.idtiers = L.idtiers

        WHERE E.idoperation = @idoperation
    `
};
