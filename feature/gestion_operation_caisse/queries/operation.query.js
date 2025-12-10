module.exports = {
<<<<<<< HEAD
    getOperations : `
    WITH Ops AS (
        SELECT 
            e.idoperation
        FROM EnteteOperationCaisse e
        WHERE 1 = 1
            --Search : numero, montant, devise
            AND (
                @search IS NULL OR 
                e.codeoperation LIKE @search OR 
                e.montant LIKE @search OR
                EXISTS (
                    SELECT 1 FROM Devise dev
                    WHERE dev.iddevise = e.iddevise AND dev.codedevise = @search
                )
            )

            --Filtre date
            AND (@date IS NULL OR CONVERT(date, e.dateoperation) = @date)

            ORDER BY e.createdat DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
    )
        SELECT 
            e.*,
            d.iddevise AS devise_iddevise,
            d.codedevise AS devise_codedevise,
            d.intitule AS devise_intitule,
            d.codeiso AS devise_codeiso,
            d.actif AS devise_actif,
            d.createdat AS devise_createdat,
            d.createdby AS devise_createdby,
            d.updatedat AS devise_updatedat,
            d.updatedby AS devise_updatedby,
            s.idsite AS site_idsite,
            s.idsociete AS site_idsociete,
            s.idcentreanalytique AS site_idcentreanalytique,
            s.libelle AS site_libelle,
            s.email AS site_email,
            s.telephone AS site_telephone,
            s.adresse AS site_adresse,
            s.estcentreanalytique AS site_estcentreanalytique,
            so.idsociete AS societe_idsociete,
            so.codesociete AS societe_codesociete,
            so.raisonsociale AS societe_raisonsociale,
            so.rccm AS societe_rccm,
            so.numnui AS societe_numnui,
            so.email AS societe_email,
            so.telephone AS societe_telephone,
            so.logo AS societe_logo,
            so.adresse AS societe_adresse,
            so.suivibudgetaire AS societe_suivibudgetaire,
            so.createdat AS societe_createdat,
            so.createdby AS societe_createdby,
            so.updatedat AS societe_updatedat,
            so.updatedby AS societe_updatedby,

            l.idligneoperation AS ligne_idligneoperation,
            l.idnature AS ligne_idnature,
            l.idcentre AS ligne_idcentre,
            l.idsociete AS ligne_idsociete,
            l.idtiers AS ligne_idtiers,
            l.libelle AS ligne_libelle,
            l.montantoperation AS ligne_montantoperation,
            l.comptabilise AS ligne_comptabilise,
            l.numpiececomptable AS ligne_numpiececomptable,
            l.datecomptabilisation AS ligne_datecomptabilisation,
            l.createdat AS ligne_createdat,
            l.createdby AS ligne_createdby,
            l.updatedat AS ligne_updatedat,
            l.updatedby AS ligne_updatedby,
            
            n.idnature AS nature_idnature,
            n.codenature AS nature_codenature,
            n.idsociete AS nature_idsociete,
            n.idcompte AS nature_idcompte,
            n.avanceajustifier AS nature_avanceajustifier,
            n.imputationtiers AS nature_imputationtiers,
            n.demandedecaissement AS nature_demandedecaissement,
            n.libelle AS nature_libelle,
            n.actif AS nature_actif,
            n.typeoperation as nature_typeoperation,
            n.createdat AS nature_createdat,
            n.createdby AS nature_createdby,
            n.updatedat AS nature_updatedat,
            n.updatedby AS nature_updatedby,
            
            c.idcentreanalytique AS centre_idcentreanalytique,
            c.codecentreanalytique AS centre_codecentreanalytique,
            c.libelle AS centre_libelle,
            c.idsociete AS centre_idsociete,
            c.actif AS centre_actif,
            c.createdat AS centre_createdat,
            c.createdby AS centre_createdby,
            c.updatedat AS centre_updatedat,
            c.updatedby AS centre_updatedby,
            
            tr.idtiers AS tiers_idtiers,
            tr.codetiers AS tiers_codetiers,
            tr.idsociete AS tiers_idsociete,
            tr.designation AS tiers_designation,
            tr.typetiers AS tiers_typetiers,
            tr.actif AS tiers_actif,
            tr.createdat AS tiers_createdat,
            tr.createdby AS tiers_createdby,
            tr.updatedat AS tiers_updatedat,
            tr.updatedby AS tiers_updatedby,
            
            t.idtypeoperation AS type_idtypeoperation,
            t.codtypeoperation AS type_codtypeoperation,
            t.montant AS type_montant,
            t.idcaisse AS type_idcaisse,
            t.taux AS type_taux,
            t.montantref AS type_montantref,
            t.createdat AS type_createdat,
            t.createdby AS type_createdby,
            t.updatedat AS type_updatedat,
            t.updatedby AS type_updatedby

        FROM Ops o
            JOIN EnteteOperationCaisse e ON e.idoperation = o.idoperation
            LEFT JOIN Devise d ON e.iddevise = d.iddevise
            LEFT JOIN Site s ON e.idsite = s.idsite
            LEFT JOIN Societe so ON e.idsociete = so.idsociete

            -- Jointure sur les lignes
            LEFT JOIN LigneOperationCaisse l
            ON l.idoperation = e.idoperation

            -- Jointure sur NatureOperation
            LEFT JOIN NatureOperation n
            ON n.idnature = l.idnature

            -- Jointure sur CentreAnalytique
            LEFT JOIN CentreAnalytique c
            ON c.idcentreanalytique = l.idcentre

            -- Jointure sur Tiers
            LEFT JOIN Tiers tr
            ON tr.idtiers = l.idtiers

            -- Jointure sur TypeOperation
            LEFT JOIN TypeOperation t
            ON t.idoperation = e.idoperation

            ORDER BY e.createdat DESC;

        SELECT COUNT(*) AS total 
            FROM EnteteOperationCaisse e
            WHERE 1 = 1
                AND (
                    @search IS NULL OR 
                    e.codeoperation LIKE @search OR 
                    e.montant LIKE @search OR
                    EXISTS (
                        SELECT 1 FROM Devise dev
                        WHERE dev.iddevise = e.iddevise AND dev.codedevise = @search
                    )
                )
                AND (@date IS NULL OR CONVERT(date, e.dateoperation) = @date);
    `,
=======
>>>>>>> origin/richard
    getAll: `
        WITH Ops AS (
            SELECT 
                e.idoperation
            FROM EnteteOperationCaisse e
            ORDER BY e.createdat DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        )
        
        SELECT 
            e.*,
            d.iddevise AS devise_iddevise,
            d.codedevise AS devise_codedevise,
            d.intitule AS devise_intitule,
            d.codeiso AS devise_codeiso,
            d.actif AS devise_actif,
            d.createdat AS devise_createdat,
            d.createdby AS devise_createdby,
            d.updatedat AS devise_updatedat,
            d.updatedby AS devise_updatedby,
            s.idsite AS site_idsite,
            s.idsociete AS site_idsociete,
            s.idcentreanalytique AS site_idcentreanalytique,
            s.libelle AS site_libelle,
            s.email AS site_email,
            s.telephone AS site_telephone,
            s.adresse AS site_adresse,
            s.estcentreanalytique AS site_estcentreanalytique,
            so.idsociete AS societe_idsociete,
            so.codesociete AS societe_codesociete,
            so.raisonsociale AS societe_raisonsociale,
            so.rccm AS societe_rccm,
            so.numnui AS societe_numnui,
            so.email AS societe_email,
            so.telephone AS societe_telephone,
            so.logo AS societe_logo,
            so.adresse AS societe_adresse,
            so.suivibudgetaire AS societe_suivibudgetaire,
            so.createdat AS societe_createdat,
            so.createdby AS societe_createdby,
            so.updatedat AS societe_updatedat,
            so.updatedby AS societe_updatedby,

            l.idligneoperation AS ligne_idligneoperation,
            l.idnature AS ligne_idnature,
            l.idcentre AS ligne_idcentre,
            l.idsociete AS ligne_idsociete,
            l.idtiers AS ligne_idtiers,
            l.libelle AS ligne_libelle,
            l.montantoperation AS ligne_montantoperation,
            l.comptabilise AS ligne_comptabilise,
            l.numpiececomptable AS ligne_numpiececomptable,
            l.datecomptabilisation AS ligne_datecomptabilisation,
            l.createdat AS ligne_createdat,
            l.createdby AS ligne_createdby,
            l.updatedat AS ligne_updatedat,
            l.updatedby AS ligne_updatedby,
            
            n.idnature AS nature_idnature,
            n.codenature AS nature_codenature,
            n.idsociete AS nature_idsociete,
            n.idcompte AS nature_idcompte,
            n.avanceajustifier AS nature_avanceajustifier,
            n.imputationtiers AS nature_imputationtiers,
            n.demandedecaissement AS nature_demandedecaissement,
            n.libelle AS nature_libelle,
            n.actif AS nature_actif,
            n.typeoperation as nature_typeoperation,
            n.createdat AS nature_createdat,
            n.createdby AS nature_createdby,
            n.updatedat AS nature_updatedat,
            n.updatedby AS nature_updatedby,
            
            c.idcentreanalytique AS centre_idcentreanalytique,
            c.codecentreanalytique AS centre_codecentreanalytique,
            c.libelle AS centre_libelle,
            c.idsociete AS centre_idsociete,
            c.actif AS centre_actif,
            c.createdat AS centre_createdat,
            c.createdby AS centre_createdby,
            c.updatedat AS centre_updatedat,
            c.updatedby AS centre_updatedby,
            
            tr.idtiers AS tiers_idtiers,
            tr.codetiers AS tiers_codetiers,
            tr.idsociete AS tiers_idsociete,
            tr.designation AS tiers_designation,
            tr.typetiers AS tiers_typetiers,
            tr.actif AS tiers_actif,
            tr.createdat AS tiers_createdat,
            tr.createdby AS tiers_createdby,
            tr.updatedat AS tiers_updatedat,
            tr.updatedby AS tiers_updatedby,
            
            t.idtypeoperation AS type_idtypeoperation,
            t.codtypeoperation AS type_codtypeoperation,
            t.montant AS type_montant,
            t.idcaisse AS type_idcaisse,
            t.taux AS type_taux,
            t.montantref AS type_montantref,
            t.createdat AS type_createdat,
            t.createdby AS type_createdby,
            t.updatedat AS type_updatedat,
            t.updatedby AS type_updatedby

        FROM Ops o
        JOIN EnteteOperationCaisse e ON e.idoperation = o.idoperation
        LEFT JOIN Devise d ON e.iddevise = d.iddevise
        LEFT JOIN Site s ON e.idsite = s.idsite
        LEFT JOIN Societe so ON e.idsociete = so.idsociete

        -- Jointure sur les lignes
        LEFT JOIN LigneOperationCaisse l
        ON l.idoperation = e.idoperation

        -- Jointure sur NatureOperation
        LEFT JOIN NatureOperation n
        ON n.idnature = l.idnature

        -- Jointure sur CentreAnalytique
        LEFT JOIN CentreAnalytique c
        ON c.idcentreanalytique = l.idcentre

        -- Jointure sur Tiers
        LEFT JOIN Tiers tr
        ON tr.idtiers = l.idtiers

        -- Jointure sur TypeOperation
        LEFT JOIN TypeOperation t
        ON t.idoperation = e.idoperation

        ORDER BY e.createdat DESC;

        -- Total count
        SELECT COUNT(*) AS total FROM EnteteOperationCaisse;
    `,

    getById: `
        SELECT * FROM Caisse WHERE idcaisse = @idcaisse
    `,

    insert: `
        INSERT INTO Caisse(
            idcaisse, codecaisse, libelle, idjournal, iddevise, idsite,
            idsociete, idcompte, actif, createdat, createdby
        ) OUTPUT INSERTED.*
        VALUES(
            @idcaisse, @codecaisse, @libelle, @idjournal, @iddevise, @idsite,
            @idsociete, @idcompte, @actif, @createdat, @createdby
        )
    `,

    update: `
        UPDATE Caisse SET 
            codecaisse = @codecaisse,
            libelle = @libelle,
            idjournal = @idjournal,
            iddevise = @iddevise,
            idsite = @idsite,
            idsociete = @idsociete,
            idcompte = @idcompte,
            actif = @actif,
            updatedat = @updatedat,
            updatedby = @updatedby
        OUTPUT INSERTED.* WHERE codecaisse = @codecaisse
    `,

    delete: `
        DELETE FROM Caisse WHERE idcaisse = @idcaisse
    `
};
