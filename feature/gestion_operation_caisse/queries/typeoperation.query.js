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
  plus_couteux: `
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
  moins_couteux: `
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
  total_caisse: `
        SELECT
            SUM(t.montantref) AS total_decaissement_jour
        FROM TypeOperation t
        JOIN EnteteOperationCaisse e ON e.idoperation = t.idoperation
        WHERE
            t.codtypeoperation = @codetypeoperation
            AND t.idperiode = @periode
    `,
  total_par_caisse: `
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
  operation: `
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
  decaissBydemandeDevCaisse: `
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
  reçucaisse: `
        SELECT
    S.raisonsociale        AS societe,
    SI.libelle             AS site,
    C.libelle               AS caisse,
    C.codecaisse            AS codecaisse,
    E.codeoperation         AS numero,
    ED.codedemande          AS numeroDemande,  -- Sera NULL si pas de demande
    E.dateoperation,
    D.codedevise            AS deviseoperation,
    DC.codedevise           AS devisecaisse,
    CP.soldeouverture,
    CP.soldefermeture,
    TOPE.codtypeoperation   AS typeoperation,
    TOPE.createdby          AS caissier,
    E.beneficiaire,
    N.libelle               AS nature,
    T.designation           AS tiersDesignation,
    CA.libelle              AS libelleCentre,
    CA.codecentreanalytique AS codecentreanalytique,
    DP.libelle              AS libelleDep,  
    DP.codedept             AS codeDep,      
    L.montantoperation      AS montantoperation,
    L.libelle               AS libelleoperation,
    TOPE.montant            AS montantpaye
FROM EnteteOperationCaisse E
JOIN TypeOperation TOPE ON TOPE.idoperation = E.idoperation
JOIN Caisse C ON C.idcaisse = TOPE.idcaisse
JOIN Societe S ON S.idsociete = E.idsociete
JOIN Site SI ON SI.idsite = E.idsite
JOIN Devise DC ON DC.iddevise = C.iddevise
JOIN Devise D ON D.iddevise = E.iddevise
JOIN CaissePeriode CP ON CP.idperiode = TOPE.idperiode
LEFT JOIN EnteteDemande ED ON E.iddemande = ED.iddemande
LEFT JOIN Departement DP ON ED.iddepartement = DP.iddepartement
LEFT JOIN ligneoperationCaisse L ON L.idoperation = E.idoperation
LEFT JOIN NatureOperation N ON N.idnature = L.idnature
LEFT JOIN Tiers T ON T.idtiers = L.idtiers
LEFT JOIN CentreAnalytique CA ON L.idcentre = CA.idcentreanalytique
WHERE E.idoperation = @idoperation
    `,
  getByCodeOperation: `
    SELECT idoperation, codeoperation, iddemande, idsociete, idsite, iddevise,
           dateoperation, montant, tauxoperation, typeoperation, beneficiaire
    FROM EnteteOperationCaisse
    WHERE codeoperation = @codeoperation
  `,
  validateurOp: `
        SELECT
                VD.idvalidationdemande,
                VD.rang,
                VD.datevalidation,
                VD.commentaire,
                VD.decision,
                U.nom,
                U.prenom

            FROM EnteteOperationCaisse E
            INNER JOIN EnteteDemande ED ON ED.iddemande = E.iddemande
            INNER JOIN ValidationDemande VD ON VD.iddemande = ED.iddemande
            INNER JOIN Utilisateur U ON U.idutilisateur = VD.idutilisateur
            WHERE E.idoperation = @idoperation

            ORDER BY
                VD.rang ASC,
                VD.datevalidation ASC;
    `,
  operationJustificatif: `
        SELECT
            e.idoperation,
            e.codeoperation,
            e.dateoperation,
            e.beneficiaire,

            SUM(CASE
                    WHEN t.codtypeoperation = 'decaissementaj'
                    THEN t.montant
                    ELSE 0
                END) AS montant_decaissement,

            SUM(CASE
                    WHEN t.codtypeoperation = 'decaissementaj'
                    THEN t.montantref
                    ELSE 0
                END) AS montant_decaissement_ref,

            SUM(CASE
                    WHEN t.codtypeoperation = 'encaissement'
                    THEN t.montant
                    ELSE 0
                END) AS montant_encaissement,

            SUM(CASE
                    WHEN t.codtypeoperation = 'encaissement'
                    THEN t.montantref
                    ELSE 0
                END) AS montant_encaissement_ref,

            ISNULL(j.total_justificatif,0) AS montant_justifie,

            ISNULL(j.total_justificatif_ref,0) AS montant_justifie_ref,

            SUM(CASE
                    WHEN t.codtypeoperation = 'decaissementaj'
                    THEN t.montant
                    ELSE 0
                END)
            - ISNULL(j.total_justificatif,0)
            - SUM(CASE
                        WHEN t.codtypeoperation ='encaissement'
                        THEN t.montant
                        ELSE 0
                    END) AS reste_a_justifier,

            SUM(CASE
                    WHEN t.codtypeoperation = 'decaissementaj'
                    THEN t.montantref
                    ELSE 0
                END)
            - ISNULL(j.total_justificatif_ref,0)
            - SUM(CASE
                        WHEN t.codtypeoperation ='encaissement'
                        THEN t.montantref
                        ELSE 0
                    END) AS reste_a_justifier_ref

        FROM EnteteOperationCaisse e

        INNER JOIN TypeOperation t
            ON t.idoperation = e.idoperation

        LEFT JOIN
        (
            SELECT
                idoperation,
                SUM(montantjustificatif) AS total_justificatif,
                SUM(montantjustificatif * taux) AS total_justificatif_ref
            FROM JustificatifOperation
            GROUP BY idoperation
        ) j
            ON j.idoperation = e.idoperation

        WHERE e.idoperation = @idoperation

        GROUP BY
            e.idoperation,
            e.codeoperation,
            e.dateoperation,
            e.beneficiaire,
            j.total_justificatif,
            j.total_justificatif_ref;
    `,

  detailsJustificatif: `
        SELECT
            jo.idjustificatifoperation,
            jo.codejustificatif,
            jo.date,
            jo.commentaire,
            dv.codedevise,
            jo.taux,
            jo.tauxinverse,
            jo.montantjustificatif,
            d.iddetailsjustificatifoperation,
            d.montantdetail,
            d.montantref,

            n.libelle AS natureoperation,
            ca.libelle AS centreanalytique,
            ca.codecentreanalytique

        FROM JustificatifOperation jo

        LEFT JOIN Devise dv
            ON dv.iddevise = jo.iddevise

        LEFT JOIN DetailsJustificatifOperation d
            ON d.idjustificatif = jo.idjustificatifoperation

        LEFT JOIN NatureOperation n
            ON n.idnature = d.idnature

        LEFT JOIN CentreAnalytique ca
            ON ca.idcentreanalytique = d.idcentreanalytique

        WHERE jo.idoperation = @idoperation

        ORDER BY jo.date, jo.codejustificatif;
    `,
  encaissementJustif: `
        SELECT
            eo.idoperation,
            eo.codeoperation,
            eo.dateoperation,
            eo.beneficiaire,

            tp.montant,
            tp.montantref,
            tp.taux,

            c.idcaisse,
            c.codecaisse,
            c.libelle AS libellecaisse,
            d.codedevise

        FROM EnteteOperationCaisse eo

        INNER JOIN TypeOperation tp
            ON tp.idoperation = eo.idoperation
        AND tp.codtypeoperation = 'encaissement'

        INNER JOIN Caisse c
            ON c.idcaisse = tp.idcaisse

        INNER JOIN Devise d
            ON d.iddevise = c.iddevise

        WHERE eo.idoperationorigine = @idoperation

        ORDER BY eo.dateoperation, eo.codeoperation;
    `,

  decaissementInit: `
        SELECT
            l.idligneoperation,
            l.libelle,
            n.libelle nature,
            ca.codecentreanalytique,
            ca.libelle centreanalytique,
            l.montantoperation,
            c.codecaisse,
            c.libelle libellecaisse,
            d.codedevise

        FROM LigneOperationCaisse l

        INNER JOIN EnteteOperationCaisse e
        ON e.idoperation=l.idoperation

        INNER JOIN TypeOperation tp
        ON tp.idoperation=e.idoperation
        AND tp.codtypeoperation='decaissementaj'

        INNER JOIN Caisse c
        ON c.idcaisse=tp.idcaisse

        INNER JOIN Devise d
        ON d.iddevise=c.iddevise

        LEFT JOIN NatureOperation n
        ON n.idnature=l.idnature

        LEFT JOIN CentreAnalytique ca
        ON ca.idcentreanalytique=l.idcentre

        WHERE e.idoperation=@idoperation

        ORDER BY n.libelle;
    `,
};
