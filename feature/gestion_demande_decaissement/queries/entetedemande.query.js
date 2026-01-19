module.exports = {
    getDemandes : `
        SELECT
            -- ================= ENTETE =================
            E.iddemande,
            E.codedemande,
            E.typedemande,
            E.libelledemande,
            E.datedemande,
            E.decaisse,
            E.solde,
            E.statut,
            E.createdat AS entete_createdat,
            E.createdby AS entete_createdby,
            E.updatedat AS entete_updatedat,
            E.updatedby AS entete_updatedby,

            -- ================= DEMANDEUR =================
            U.idutilisateur,
            U.nom,
            U.prenom,

            -- ================= DEVISE =================
            DE.iddevise,
            DE.codedevise,

            -- ================= CIRCUIT =================
            CI.idcircuitvalidation AS circuit_idcircuit,
            CI.codecircuitvalidation AS circuit_codecircuit,
            CI.typeentite AS circuit_typeentite,
            CI.typeaction AS circuit_typeaction,
            CI.idsociete AS circuit_idsociete,
            CI.idsite AS circuit_idsite,
            CI.iddepartement AS circuit_iddepartement,
            CI.actif AS circuit_actif,

            -- ================= SOCIETE / SITE =================
            S.idsociete,
            S.codesociete,
            S.raisonsociale AS societe,
            SI.idsite,
            SI.libelle AS site,

            -- ================= LIGNE =================
            L.idlignedemande,
            L.numligne,
            L.libellelignedemande,
            L.montantdemande,

            -- ================= NATURE / CENTRE =================
            N.idnature AS idnatureop,
            N.libelle AS natureoperation,
            C.idcentreanalytique AS idcentreana,
            C.libelle AS centreanalytique,

            -- ================= DETAILS =================
            D.iddetailsdemande,
            D.quantite,
            D.montant,
            D.description

        FROM EnteteDemande E
        LEFT JOIN Utilisateur U ON U.idutilisateur = E.iddemandeur
        LEFT JOIN Societe S ON S.idsociete = E.idsociete
        LEFT JOIN Site SI ON SI.idsite = E.idsite
        LEFT JOIN Devise DE ON DE.iddevise = E.iddevise
        LEFT JOIN CircuitValidation CI ON CI.idcircuitvalidation = E.idcircuit

        LEFT JOIN LigneDemande L ON L.iddemande = E.iddemande
        LEFT JOIN NatureOperation N ON N.idnature = L.idnature
        LEFT JOIN CentreAnalytique C ON C.idcentreanalytique = L.idcentre

        LEFT JOIN DetailsDemande D ON D.idlignedemande = L.idlignedemande

        WHERE 1 = 1 AND (@search IS NULL OR E.codedemande LIKE @search)
            AND (@search IS NULL OR E.libelledemande = @search)

        ORDER BY E.createdat DESC, L.numligne
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

        SELECT COUNT(*) AS total
          FROM EnteteDemande
          WHERE 1 = 1 AND (@search IS NULL OR codedemande LIKE @search)
            AND (@search IS NULL OR libelledemande = @search);
    `,
    demandes : `
        WITH EntetesPaged AS (
            SELECT
                E.iddemande
            FROM EnteteDemande E
            WHERE 1 = 1
            AND (
                @search IS NULL
                OR E.codedemande LIKE @search
                OR E.libelledemande LIKE @search
            )
            ORDER BY E.createdat DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        )
        
        SELECT
            -- ================= ENTETE =================
            E.iddemande,
            E.codedemande,
            E.typedemande,
            E.libelledemande,
            E.datedemande,
            E.decaisse,
            E.solde,
            E.statut,
            E.idcircuit,
            E.createdat AS entete_createdat,
            E.createdby AS entete_createdby,
            E.updatedat AS entete_updatedat,
            E.updatedby AS entete_updatedby,
            CASE 
                WHEN E.idcircuit IS NOT NULL THEN 1
                ELSE 0
            END AS circuitExist,

            -- ================= DEMANDEUR =================
            U.idutilisateur,
            U.nom,
            U.prenom,

            -- ================= DEVISE =================
            DE.iddevise,
            DE.codedevise,

            -- ================= DEPARTEMENT =================
            DEP.iddepartement,
            DEP.codedept,
            DEP.libelle AS libelledept,

            -- ================= CIRCUIT =================
            CI.idcircuitvalidation AS circuit_idcircuit,
            CI.codecircuitvalidation AS circuit_codecircuit,
            CI.typeentite AS circuit_typeentite,
            CI.typeaction AS circuit_typeaction,
            CI.idsociete AS circuit_idsociete,
            CI.idsite AS circuit_idsite,
            CI.actif AS circuit_actif,

            -- ================= SOCIETE / SITE =================
            S.idsociete,
            S.codesociete,
            S.raisonsociale AS societe,
            SI.idsite,
            SI.libelle AS site,

            -- ================= LIGNE =================
            L.idlignedemande,
            L.numligne,
            L.libellelignedemande,
            L.montantdemande,

            -- ================= NATURE / CENTRE =================
            N.idnature AS idnatureop,
            N.libelle AS natureoperation,
            C.idcentreanalytique AS idcentreana,
            C.libelle AS centreanalytique,

            -- ================= DETAILS =================
            D.iddetailsdemande,
            D.quantite,
            D.montant,
            D.description

        FROM EntetesPaged EP
        JOIN EnteteDemande E ON E.iddemande = EP.iddemande

        LEFT JOIN Utilisateur U ON U.idutilisateur = E.iddemandeur
        LEFT JOIN Societe S ON S.idsociete = E.idsociete
        LEFT JOIN Site SI ON SI.idsite = E.idsite
        LEFT JOIN Devise DE ON DE.iddevise = E.iddevise
        LEFT JOIN Departement DEP ON DEP.iddepartement = E.iddepartement
        LEFT JOIN CircuitValidation CI ON CI.idcircuitvalidation = E.idcircuit

        LEFT JOIN LigneDemande L ON L.iddemande = E.iddemande
        LEFT JOIN NatureOperation N ON N.idnature = L.idnature
        LEFT JOIN CentreAnalytique C ON C.idcentreanalytique = L.idcentre
        LEFT JOIN DetailsDemande D ON D.idlignedemande = L.idlignedemande

        ORDER BY E.createdat DESC, L.numligne;

        SELECT COUNT(*) AS total
        FROM EnteteDemande E
        WHERE 1 = 1
        AND (
            @search IS NULL
            OR E.codedemande LIKE @search
            OR E.libelledemande LIKE @search
        );
    `,
    insert : `
        INSERT INTO EnteteDemande ( iddemande, codedemande, iddemandeur, typedemande, taux,
            libelledemande, datedemande, decaisse, solde, statut, idcircuit, idsociete, idsite, iddepartement, iddevise, niveauactuel,
            createdat, createdby )
          OUTPUT INSERTED.*
          VALUES ( @iddemande, @codedemande, @iddemandeur, @typedemande, @taux, @libelledemande, @datedemande, @decaisse, @solde, @statut,
            @idcircuit, @idsociete, @idsite, @iddepartement, @iddevise, @niveauactuel, @createdat, @createdby)
    `,
    getAll : `
        SELECT *
          FROM EnteteDemande
          WHERE (@search IS NULL OR codedemande LIKE @search)
            AND (@statut IS NULL OR statut = @statut)
          ORDER BY createdat DESC
          OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

          SELECT COUNT(*) AS total
          FROM EnteteDemande
          WHERE (@search IS NULL OR codedemande LIKE @search)
            AND (@statut IS NULL OR statut = @statut);
    `,
    getOne : `
        SELECT
            -- ================= ENTETE =================
            E.iddemande,
            E.codedemande,
            E.typedemande,
            E.libelledemande,
            E.datedemande,
            E.decaisse,
            E.solde,
            E.statut,
            E.niveauactuel,
            E.createdat AS entete_createdat,

            -- ================= DEMANDEUR =================
            U.idutilisateur,
            U.nom,
            U.prenom,

            -- ================= CIRCUIT ================= 
            CI.idcircuitvalidation AS circuit_idcircuit, 
            CI.codecircuitvalidation AS circuit_codecircuit, 
            CI.typeentite AS circuit_typeentite, 
            CI.typeaction AS circuit_typeaction, 
            CI.idsociete AS circuit_idsociete, 
            CI.idsite AS circuit_idsite, 
            CI.actif AS circuit_actif,

            -- ================= SOCIETE / SITE =================
            S.idsociete,
            S.raisonsociale AS societe,
            SI.idsite,
            SI.libelle AS site,

            -- ================= DEVISE ================= 
            DE.iddevise, 
            DE.codedevise,

            -- ================= DEPARTEMENT =================
            DEP.iddepartement,
            DEP.codedept,
            DEP.libelle AS libelledept,

            -- ================= LIGNE =================
            L.idlignedemande,
            L.numligne,
            L.libellelignedemande,
            L.montantdemande,

            -- ================= NATURE / CENTRE =================
            N.idnature AS idnatureop,
            N.libelle AS natureoperation,
            C.idcentreanalytique AS idcentreana,
            C.libelle AS centreanalytique,

            -- ================= Tiers =================
            T.idtiers AS idtiers,
            T.codetiers AS codetiers,
            T.designation AS designationtiers,

            -- ================= DETAILS =================
            D.iddetailsdemande,
            D.quantite,
            D.montant,
            D.description

        FROM EnteteDemande E
        LEFT JOIN Utilisateur U ON U.idutilisateur = E.iddemandeur
        LEFT JOIN Societe S ON S.idsociete = E.idsociete
        LEFT JOIN Site SI ON SI.idsite = E.idsite
        LEFT JOIN Devise DE ON DE.iddevise = E.iddevise
        LEFT JOIN Departement DEP ON DEP.iddepartement = E.iddepartement
        LEFT JOIN CircuitValidation CI ON CI.idcircuitvalidation = E.idcircuit

        LEFT JOIN LigneDemande L 
            ON L.iddemande = E.iddemande

        LEFT JOIN NatureOperation N 
            ON N.idnature = L.idnature

        LEFT JOIN CentreAnalytique C 
            ON C.idcentreanalytique = L.idcentre
        
        LEFT JOIN Tiers T 
            ON T.idtiers = L.idtiers

        -- ⚠️ JOINTURE DÉTAIL SANS FILTRAGE
        LEFT JOIN DetailsDemande D 
            ON D.idlignedemande = L.idlignedemande
            AND D.iddemande = E.iddemande

        WHERE E.iddemande = @iddemande
    `,
    update : `
        UPDATE EnteteDemande
        SET libelledemande = @libelledemande,
            typedemande = @typedemande,
            datedemande = @datedemande,
            iddevise = @devise,
            iddepartement = @departement,
            updatedat = @updatedat,
            updatedby = @updatedby
        WHERE iddemande = @iddemande
    `,
    delete : `
        DELETE FROM EnteteDemande WHERE iddemande = @iddemande
    `,
    decaisse : `
        UPDATE EnteteDemande
        SET decaisse = @decaisse
        WHERE iddemande = @iddemande
    `,
    circuitDemande: `
        Select CV.*
        From CircuitValidation CV
        Where CV.typeaction = 'decaissement' 
        AND CV.actif = 1 
        AND CV.typeentite = 'site'
        AND CV.idsite = @idsite
    `,
    validateurCircuit : `
        Select CE.*,
            CV.typeaction,
            CV.typeentite,
            CV.idsite,
            U.idutilisateur,
            U.nom,
            U.prenom
        FROM Circuitetape CE
        LEFT JOIN CircuitValidation CV ON CV.idcircuitvalidation = CE.idcircuitvalidation
        LEFT JOIN Etapevalidateur EV ON EV.idcircuitetape = CE.idcircuitetape
        LEFT JOIN Utilisateur U ON U.idutilisateur = EV.idutilisateur
        WHERE CE.idcircuitvalidation = @idcircuitvalidation
    `,
    initvalidationDemande: `
        INSERT INTO ValidationDemande
        (iddemande, idcircuitvalidation, idcircuitetape, idutilisateur, decision, rang)
        OUTPUT INSERTED.*
        VALUES (@iddemande, @idcircuitvalidation ,@idcircuitetape ,@idutilisateur , 'en attente', @rang)
    `,
    getDemandeAvalider : `
        SELECT DISTINCT
            ED.iddemande,
            ED.codedemande,
            ED.libelledemande,
            ED.niveauactuel,
            ED.idcircuit,

            CASE 
            WHEN EV.idutilisateur IS NOT NULL THEN 1
            ELSE 0
            END AS canValidate

        FROM EnteteDemande ED
        LEFT JOIN Circuitetape CE 
            ON CE.idcircuitvalidation = ED.idcircuit
        AND CE.rang = ED.niveauactuel
        LEFT JOIN Etapevalidateur EV 
            ON EV.idcircuitetape = CE.idcircuitetape
        AND EV.idutilisateur = @idutilisateur

        WHERE ED.statut < 2;
    `,
    circuitValidateur: `
        Select VD.*,
            U.nom,
            U.prenom,
            CI.codecircuitvalidation,
            D.codedemande
        from ValidationDemande VD
            LEFT JOIN EnteteDemande D ON D.iddemande = VD.iddemande
            LEFT JOIN Utilisateur U ON U.idutilisateur = VD.idutilisateur
            LEFT JOIN Circuitvalidation CI ON CI.idcircuitvalidation = VD.idcircuitvalidation
        Where VD.iddemande = @iddemande
        ORDER BY VD.rang ASC;
    `,
    detailBudget: `
        Select E.iddemande, E.codedemande, E.datedemande, E.decaisse, E.solde, E.statut, E.idsite, DE.codedevise, BU.codebudget, BU.libelle, BU.typebudget, BU.datedebut, BU.datefin, BU.cloture, BU.valide,
			LD.idbudget, SUM(LD.montantref) AS montant_demande
        From EnteteDemande E
            LEFT JOIN LigneDemande LD ON LD.iddemande = E.iddemande
            LEFT JOIN Budget BU ON BU.idbudget = LD.idbudget
            LEFT JOIN Devise DE ON DE.iddevise = E.iddevise
        Where E.iddemande = @iddemande
        Group By E.iddemande, E.codedemande, E.datedemande, E.decaisse, E.solde, E.statut, E.idsite, DE.codedevise, BU.codebudget, BU.libelle, BU.typebudget, BU.datedebut, BU.datefin, BU.cloture, BU.valide,
                LD.idbudget
    `,
    bydetailLigneBudget : `
        Select E.iddemande, E.codedemande, E.iddepartement, DP.codedept, DP.libelle as dept_libelle, E.datedemande, E.decaisse, E.solde, E.statut, E.idsite, DE.codedevise, BU.codebudget, BU.libelle, BU.typebudget, BU.datedebut, BU.datefin, BU.cloture, BU.valide,
			LD.idbudget,BDN.idnature, N.codenature, N.libelle AS nature_lib, LD.budgetconso, LD.preengage, LD.engage, LD.realise, BDN.montantprevisionsociete, SUM(LD.montantdemande) AS montant_demande, SUM(LD.montantref) AS montant_ref
        From EnteteDemande E
            LEFT JOIN LigneDemande LD ON LD.iddemande = E.iddemande
            LEFT JOIN Budget BU ON BU.idbudget = LD.idbudget
			LEFT JOIN BudgetDepartementNature BDN ON BDN.iddepartement = E.iddepartement AND BDN.idbudget = BU.idbudget
			AND BDN.idnature = LD.idnature
			LEFT JOIN NatureOperation N ON N.idnature = LD.idnature
            LEFT JOIN Devise DE ON DE.iddevise = E.iddevise
            LEFT JOIN Departement DP ON DP.iddepartement = E.iddepartement
        Where E.iddemande = @iddemande
        Group By E.iddemande, E.codedemande, E.iddepartement, DP.codedept, DP.libelle, E.datedemande, E.decaisse, E.solde, E.statut, E.idsite, DE.codedevise, BU.codebudget, BU.libelle, BU.typebudget, BU.datedebut, BU.datefin, BU.cloture, BU.valide,
			LD.idbudget,BDN.idnature, N.codenature, N.libelle, LD.budgetconso, LD.budgetconso, LD.preengage, LD.engage, LD.realise, BDN.montantprevisionsociete
    `,
    checkDroit : `
        SELECT 1
        FROM ValidationDemande
        WHERE iddemande = @iddemande
            AND rang = @niveauactuel
            AND idutilisateur = @iduser
            AND decision = 'en attente'
    `,
    saveDecision : `
        UPDATE ValidationDemande
        SET decision = @decision,
            commentaire = @commentaire,
            motif = @motif,
            datevalidation = GETDATE()
        WHERE iddemande = @iddemande
        AND idutilisateur = @iduser
    `,
    updateStatut : `
        UPDATE EnteteDemande
        SET statut = @statut
        WHERE iddemande = @iddemande
    `,
    dernierNiveau: `
        SELECT MAX(rang) AS dernierRang
        FROM ValidationDemande
        WHERE iddemande = @iddemande;
    `,
    niveauActuel: `
        UPDATE EnteteDemande
        SET niveauactuel = niveauactuel + 1
        WHERE iddemande = @iddemande
    `,
    dernierTaux : `
        SELECT TOP 1
            coefficient,
            coefficientinverse,
            datecours
        FROM Tauxdevise
        WHERE
            iddeviseorigine = @idDeviseDemande
            AND iddevisedestination = @idDeviseSociete
            AND datecours <= @date
        ORDER BY datecours DESC;
    `
}