module.exports = {
    getAll: `
        SELECT 
            c.*,
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
        FROM Caisse c
        LEFT JOIN Journal j ON c.idjournal = j.idjournal
        LEFT JOIN Devise d ON c.iddevise = d.iddevise
        LEFT JOIN Site s ON c.idsite = s.idsite
        LEFT JOIN Societe so ON c.idsociete = so.idsociete
        LEFT JOIN PlanComptable pc ON c.idcompte = pc.idcompte

        ORDER BY createdat DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY;

        SELECT COUNT(*) AS total FROM Caisse;
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
