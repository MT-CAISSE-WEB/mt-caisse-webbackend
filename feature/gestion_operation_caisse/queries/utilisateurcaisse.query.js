module.exports = {
    getAll : `
        SELECT 
            uc.*,
            u.idutilisateur AS user_idutilisateur,
            u.codeutilisateur AS user_codeutilisateur,
            u.idsociete AS user_idsociete,
            u.nom AS user_nom,
            u.prenom AS user_prenom, 
            u.adresse AS user_adresse, 
            u.telephone AS user_telephone, 
            u.email AS user_email, 
            u.typeentitesite AS user_typeentitesite, 
            u.typeentitedepartement AS user_typeentitedepartement, 
            u.typeentitesociete AS user_typeentitesociete,
            u.acheteur AS user_acheteur, 
            c.idcaisse AS caisse_idcaisse,
            c.codecaisse AS caisse_codecaisse,
            c.libelle AS caisse_libelle,
            c.idjournal AS caisse_idjournal,
            c.iddevise AS caisse_iddevise,
            c.idsite AS caisse_idsite,
            c.idsociete AS caisse_idsociete,
            c.idcompte AS caisse_idcompte,
            c.actif AS caisse_actif,
            c.createdat AS caisse_createdat,
            c.createdby AS caisse_createdby,
            s.idsociete AS societe_idsociete,
            s.codesociete AS societe_codesociete,
            s.raisonsociale AS societe_raisonsociale,
            s.rccm AS societe_rccm,
            s.numnui AS societe_numnui,
            s.email AS societe_email,
            s.telephone AS societe_telephone,
            s.logo AS societe_logo,
            s.adresse AS societe_adresse,
            s.suivibudgetaire AS societe_suivibudgetaire,
            s.createdat AS societe_createdat,
            s.createdby AS societe_createdby,
            s.updatedat AS societe_updatedat,
            s.updatedby AS societe_updatedby

        FROM UtilisateurCaisse uc
        LEFT JOIN Utilisateur u ON u.idutilisateur = uc.idutilisateur
        LEFT JOIN Caisse c ON c.idcaisse = uc.idcaisse
        LEFT JOIN Societe s ON s.idsociete = uc.idsociete

        WHERE  (@actif IS NULL OR uc.actif = @actif)
        
        ORDER BY uc.createdat ASC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY

        SELECT COUNT(*) AS total
            FROM UtilisateurCaisse
            WHERE (@actif IS NULL OR actif = @actif)
                
    `,
    insert : `
        INSERT INTO UtilisateurCaisse (idutilisateurcaisse,idcaisse,idutilisateur,idsociete,actif,createdat,createdby)
        OUTPUT INSERTED.* 
        VALUES (@idutilisateurcaisse,@idcaisse,@idutilisateur,@idsociete,@actif,@createdat,@createdby);
    `,
    update : `
        UPDATE UtilisateurCaisse SET idcaisse = @idcaisse,
        idutilisateur = @idutilisateur, idsociete = @idsociete, actif = @actif, updatedat = @updatedat, updatedby = @updatedby
        OUTPUT INSERTED.* 
        WHERE idutilisateurcaisse = @idutilisateurcaisse;
    `,
    getbyId: `
        SELECT * FROM UtilisateurCaisse WHERE idutilisateurcaisse = @idutilisateurcaisse;
    `,
    deletesoft : `
        UPDATE UtilisateurCaisse SET actif = 0,
            updatedat = @updatedat,
            updatedby = @updatedby
            OUTPUT INSERTED.* 
            WHERE idutilisateurcaisse = @idutilisateurcaisse;
    `,
    getcaisseUser : `
        SELECT 1 FROM UtilisateurCaisse
        WHERE idcaisse = @idcaisse AND idutilisateur = @idutilisateur
    `,
    delete : `
        Delete from UtilisateurCaisse WHERE idutilisateurcaisse = @idutilisateurcaisse;
    `,
    getcaisseByUser : `
        SELECT *
        FROM UtilisateurCaisse
        WHERE idutilisateur = @idutilisateur  AND  actif = 1 
    `,
    getRecentCaisseUser : `
        SELECT
            -- ================= UTILISATEUR CAISSE =================
            UC.idutilisateurcaisse,
            UC.idutilisateur,
            UC.actif AS utilisateurcaisse_actif,

            -- ================= CAISSE =================
            C.idcaisse,
            C.codecaisse,
            C.libelle AS libellecaisse,
            C.iddevise,
            C.idsite,
            C.idsociete,
            C.soldeinitialisation,
            C.seuilmnimal,
            C.actif AS caisse_actif,

            -- ================= DEVISE ========================= --
            D.codedevise,
            D.intitule,
            D.codeiso,

            -- ================= DERNIÈRE PÉRIODE =================
            CP.idperiode,
            CP.dateperiode,
            CP.soldeouverture,
            CP.soldefermeture,
            CP.montantphysique,
            CP.ecart,
            CP.statut AS statutperiode

        FROM UtilisateurCaisse UC
        JOIN Caisse C ON C.idcaisse = UC.idcaisse AND C.actif = 1
        LEFT JOIN Devise D ON D.iddevise = C.iddevise AND D.actif = 1

        OUTER APPLY (
            SELECT TOP 1 *
            FROM CaissePeriode CP
            WHERE CP.idcaisse = C.idcaisse
            ORDER BY CP.dateperiode DESC
        ) CP

        WHERE UC.idutilisateur = @idutilisateur
        AND UC.actif = 1;
    `,
    getLoadCaisseUser : `
        WITH DernierePeriode AS (
            SELECT
                cp.idcaisse,
                cp.idperiode,
                cp.dateperiode,
                cp.soldeouverture,
                cp.statut,
                ROW_NUMBER() OVER (
                    PARTITION BY cp.idcaisse
                    ORDER BY cp.dateperiode DESC
                ) AS rn
            FROM CaissePeriode cp
        )

        SELECT
            uc.idutilisateur,

            c.idcaisse,
            c.codecaisse,
            c.libelle AS libellecaisse,

            d.iddevise,
            d.codedevise,
            d.intitule AS libelledevise,

            dp.idperiode,
            dp.dateperiode,
            dp.statut AS statutperiode,

            -- Total entrées
            ISNULL(SUM(
                CASE
                    WHEN tope.codtypeoperation = 'encaissement'
                        THEN tope.montantref
                    ELSE 0
                END
            ), 0) AS totalentree,

            -- Total sorties
            ISNULL(SUM(
                CASE
                    WHEN tope.codtypeoperation <> 'encaissement'
                        THEN tope.montantref
                    ELSE 0
                END
            ), 0) AS totalsortie,


            -- Solde dynamique (devise caisse)
            dp.soldeouverture
            + ISNULL(SUM(
                CASE
                    WHEN tope.codtypeoperation = 'encaissement'
                        THEN tope.montant
                    WHEN tope.codtypeoperation <> 'encaissement'
                        THEN -tope.montant
                    ELSE 0
                END
            ), 0) AS soldedynamique,

            -- Taux de change utilisé
            tx.coefficient AS tauxdevise,

            -- Solde converti vers devise destination
            (dp.soldeouverture
            + ISNULL(SUM(
                CASE
                    WHEN tope.codtypeoperation = 'encaissement'
                        THEN tope.montantref
                    WHEN tope.codtypeoperation <> 'encaissement'
                        THEN -tope.montantref
                    ELSE 0
                END
            ), 0)) * ISNULL(tx.coefficient, 1) AS soldedynamiqueconverti

        FROM UtilisateurCaisse uc

        INNER JOIN Caisse c
            ON c.idcaisse = uc.idcaisse

        INNER JOIN Devise d
            ON d.iddevise = c.iddevise

        INNER JOIN DernierePeriode dp
            ON dp.idcaisse = c.idcaisse
            AND dp.rn = 1

        LEFT JOIN TypeOperation tope
            ON tope.idcaisse = c.idcaisse
            AND tope.idperiode = dp.idperiode

        -- Dernier taux ≤ date de la période
        OUTER APPLY (
            SELECT TOP 1
                td.coefficient,
                td.coefficientinverse,
                td.datecours
            FROM Tauxdevise td
            WHERE td.iddeviseorigine = d.iddevise
            AND td.iddevisedestination = @iddevisesociete
            AND td.datecours <= dp.dateperiode
            ORDER BY td.datecours DESC
        ) tx

        WHERE uc.idutilisateur = @idutilisateur
        AND uc.actif = 1

        GROUP BY
            uc.idutilisateur,
            c.idcaisse,
            c.codecaisse,
            c.libelle,
            d.iddevise,
            d.codedevise,
            d.intitule,
            dp.idperiode,
            dp.dateperiode,
            dp.soldeouverture,
            dp.statut,
            tx.coefficient

        ORDER BY c.libelle;
    `,
    getCaisseUserRecent : `
        WITH DernierePeriode AS (
            SELECT *,
                ROW_NUMBER() OVER (PARTITION BY idcaisse ORDER BY dateperiode DESC) AS rn
            FROM CaissePeriode
        )

        SELECT
            UC.idutilisateurcaisse,
            UC.idutilisateur,
            UC.actif AS utilisateurcaisse_actif,

            C.idcaisse,
            C.codecaisse,
            C.libelle AS libellecaisse,
            C.iddevise,
            C.idsite,
            C.idsociete,
            C.soldeinitialisation,
            C.seuilmnimal,
            C.actif AS caisse_actif,

            D.codedevise,
            D.intitule,
            D.codeiso,

            CP.idperiode,
            CP.dateperiode,
            CP.soldeouverture,
            CP.soldefermeture,
            CP.montantphysique,
            CP.ecart,
            CP.statut AS statutperiode

        FROM UtilisateurCaisse UC
        JOIN Caisse C ON C.idcaisse = UC.idcaisse AND C.actif = 1
        LEFT JOIN Devise D ON D.iddevise = C.iddevise AND D.actif = 1

        LEFT JOIN DernierePeriode CP 
        ON CP.idcaisse = C.idcaisse AND CP.rn = 1

        WHERE UC.idutilisateur = @idutilisateur
        AND UC.actif = 1;
    `
}