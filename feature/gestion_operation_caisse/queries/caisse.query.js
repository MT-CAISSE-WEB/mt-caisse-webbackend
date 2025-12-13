module.exports = {
    getAll: `
        WITH Cais AS (
        SELECT 
            c.idcaisse
        FROM Caisse c
        WHERE 1 = 1
            --Search : codecaisse, devise, journal
            AND (
                @search IS NULL OR 
                c.idcaisse LIKE @search OR 
                EXISTS (
                    SELECT 1 FROM Devise dev
                    WHERE dev.iddevise = c.iddevise AND dev.codedevise = @search
                ) OR EXISTS (
                    SELECT 1 FROM Journal jou
                    WHERE jou.idjournal = c.idjournal AND jou.codejournal = @search
                )
            ) AND (@actif IS NULL OR actif = @actif)

            ORDER BY c.createdat DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
    )
        SELECT 
            e.*,
            j.idjournal AS journal_idjournal,
            j.codejournal AS journal_codejournal,
            j.idsociete AS journal_idsociete,
            j.designation AS journal_designation,
            j.createdat AS journal_createdat,
            j.createdby AS journal_createdby,
            j.updatedat AS journal_updatedat,
            j.updatedby AS journal_updatedby,
            j.actif AS journal_actif,
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
            pc.idcompte AS compte_idcompte,
            pc.idsociete AS compte_idsociete,
            pc.numcompte AS compte_numcompte,
            pc.libelle AS compte_libelle,
            pc.ventillable AS compte_ventillable,
            pc.auxiliaire AS compte_auxiliaire,
            pc.actif AS compte_actif,
            pc.suivibudgetaire AS compte_suivibudgetaire,
            pc.suivibudgetairemensuel AS compte_suivibudgetairemensuel,
            pc.createdat AS compte_createdat,
            pc.createdby AS compte_createdby,
            pc.updatedat AS compte_updatedat,
            pc.updatedby AS compte_updatedby,
            pc.actif AS compte_actif
        FROM Cais c
        JOIN Caisse e ON e.idcaisse = c.idcaisse
        LEFT JOIN Journal j ON e.idjournal = j.idjournal
        LEFT JOIN Devise d ON e.iddevise = d.iddevise
        LEFT JOIN Site s ON e.idsite = s.idsite
        LEFT JOIN Societe so ON e.idsociete = so.idsociete
        LEFT JOIN PlanComptable pc ON e.idcompte = pc.idcompte

        ORDER BY e.createdat DESC

        SELECT COUNT(*) AS total 
            FROM Caisse e
            WHERE 1 = 1
                AND (
                @search IS NULL OR 
                e.idcaisse LIKE @search OR 
                EXISTS (
                    SELECT 1 FROM Devise dev
                    WHERE dev.iddevise = e.iddevise AND dev.codedevise = @search
                ) OR EXISTS (
                    SELECT 1 FROM Journal jou
                    WHERE jou.idjournal = e.idjournal AND jou.codejournal = @search
                )
            ) AND (@actif IS NULL OR actif = @actif);
    `,

    getById: `
        SELECT * FROM Caisse WHERE idcaisse = @idcaisse
    `,

    insert: `
        INSERT INTO Caisse(
            idcaisse, codecaisse, libelle, idjournal, iddevise, idsite,
            idsociete, idcompte, dateinitialisation, soldeinitialisation, seuilmnimal, actif, createdat, createdby
        ) OUTPUT INSERTED.*
        VALUES(
            @idcaisse, @codecaisse, @libelle, @idjournal, @iddevise, @idsite,
            @idsociete, @idcompte, @dateinitialisation, @soldeinitialisation, @seuilmnimal, @actif, @createdat, @createdby
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
            dateinitialisation = @dateinitialisation,
            soldeinitialisation = @soldeinitialisation,
            seuilmnimal = @seuilmnimal,
            actif = @actif,
            updatedat = @updatedat,
            updatedby = @updatedby
        OUTPUT INSERTED.* WHERE codecaisse = @codecaisse
    `,

    delete: `
        DELETE FROM Caisse WHERE idcaisse = @idcaisse
    `
};
