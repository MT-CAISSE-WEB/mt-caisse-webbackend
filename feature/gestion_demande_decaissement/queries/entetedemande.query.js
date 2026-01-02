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
        LEFT JOIN Circuitvalidation CI ON CI.idcircuitvalidation = E.idcircuitvalidation

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

        FROM EntetesPaged EP
        JOIN EnteteDemande E ON E.iddemande = EP.iddemande

        LEFT JOIN Utilisateur U ON U.idutilisateur = E.iddemandeur
        LEFT JOIN Societe S ON S.idsociete = E.idsociete
        LEFT JOIN Site SI ON SI.idsite = E.idsite
        LEFT JOIN Devise DE ON DE.iddevise = E.iddevise
        LEFT JOIN Departement DEP ON DEP.iddepartement = E.iddepartement
        LEFT JOIN Circuitvalidation CI ON CI.idcircuitvalidation = E.idcircuitvalidation

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
        INSERT INTO EnteteDemande ( iddemande, codedemande, iddemandeur, typedemande,
            libelledemande, datedemande, decaisse, solde, statut, idcircuitvalidation, idsociete, idsite, iddepartement, iddevise,
            createdat, createdby )
          OUTPUT INSERTED.*
          VALUES ( @iddemande, @codedemande, @iddemandeur, @typedemande, @libelledemande, @datedemande, @decaisse, @solde, @statut,
            @idcircuitvalidation, @idsociete, @idsite, @iddepartement, @iddevise, @createdat, @createdby)
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
            CI.iddepartement AS circuit_iddepartement, 
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
        LEFT JOIN Circuitvalidation CI ON CI.idcircuitvalidation = E.idcircuitvalidation

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
}