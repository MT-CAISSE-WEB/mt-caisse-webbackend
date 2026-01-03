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
    `
};
