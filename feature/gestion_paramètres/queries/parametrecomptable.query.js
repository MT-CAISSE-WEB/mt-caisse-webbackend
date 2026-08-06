module.exports = {
    insert : `
        INSERT INTO ParametreComptable (idparametrecomptable, idsociete, idjournal, idcompte, urldossier, createdby, createdat )
            OUTPUT INSERTED.*
        VALUES (@idparametrecomptable, @idsociete, @idjournal, @idcompte, @urldossier, @createdby, @createdat) ;
    `,
    getall : `
        SELECT * FROM ParametreComptable ;
    `,
    update : `
        UPDATE ParametreComptable
        SET idsociete = @idsociete, idjournal = @idjournal, idcompte = @idcompte, urldossier = @urldossier,
            updatedat = @updatedat, updatedby = @updatedby
        WHERE idparametrecomptable = @idparametrecomptable ;
    `,
    delete : `
        DELETE FROM ParametreComptable
        WHERE idparametrecomptable = @idparametrecomptable ;
    `,
    updateJournal : `
        UPDATE ParametreComptable
        SET idjournal = @idjournal, updatedat = @updatedat, updatedby = @updatedby
        WHERE idsociete = @idsociete ;
    `,
    updateCompte : `
        UPDATE ParametreComptable
        SET idcompte = @idcompte, updatedat = @updatedat, updatedby = @updatedby
        WHERE idsociete = @idsociete ;
    `,
    updateUrldossier : `
        UPDATE ParametreComptable
        SET urldossier = @urldossier, updatedat = @updatedat, updatedby = @updatedby
        WHERE idsociete = @idsociete ;
    `,
    getBySociete : `
        SELECT 
            pc.idsociete,
            s.codesociete,
            s.raisonsociale,

            pc.idjournal,
            j.codejournal,
            j.designation AS journal_designation,

            pc.idcompte,
            c.numcompte,
            c.libelle AS compte_libelle,

            pc.urldossier,
            pc.analytiquesite,
            pc.analytiquetable,
            pc.axesecond

        FROM ParametreComptable pc

        LEFT JOIN Societe s 
            ON pc.idsociete = s.idsociete

        LEFT JOIN Journal j 
            ON pc.idjournal = j.idjournal

        LEFT JOIN PlanComptable c 
            ON pc.idcompte = c.idcompte

        WHERE pc.idsociete = @idsociete;
    `,
    findAllcorrespondance: `
        SELECT 
        c.idcorrespondance,
        c.idcentreanalytique AS idcentre_co,
        c.correspondance,
        c.actif AS actif_co,
        c.createdby AS createdby_co,
        c.createdat AS createdat_co,
        c.updatedby AS updatedby_co,
        c.updatedat AS updatedat_co,
        ca.*
      FROM CorrespondanceAnalytique c
      LEFT JOIN CentreAnalytique ca ON c.idcentreanalytique = ca.idcentreanalytique
      ORDER BY c.createdat DESC
    `,
    findCorrespondanceById : `
        SELECT C.*, CA.libelle AS centreAnalytiqueNom,
        CA.actif
        FROM CorrespondanceAnalytique C
        LEFT JOIN CentreAnalytique CA ON C.idcentreanalytique = CA.idcentreanalytique
        WHERE idcorrespondance = @idcorrespondance
    `,
    insertCorrespondance : `
        INSERT INTO CorrespondanceAnalytique (
          idcorrespondance, idcentreanalytique, correspondance, actif, createdby, createdat
        )
        OUTPUT INSERTED.*
        VALUES ( @idcorrespondance, @idcentreanalytique, @correspondance,
          @actif, @createdby, @createdat )
    `,
    // updateCorrespondance : `
    //     UPDATE CorrespondanceAnalytique
    //     SET ${setClause}
    //     WHERE idcorrespondance = @id
    //     SELECT * FROM CorrespondanceAnalytique WHERE idcorrespondance = @id
    // `
    updateCorrespondance : `
        UPDATE CorrespondanceAnalytique
        SET actif = 0, updatedby = @updatedby, updatedat = GETDATE()
        WHERE idcorrespondance = @id
        SELECT * FROM CorrespondanceAnalytique WHERE idcorrespondance = @id
    `,
    hardDelete : `
        DELETE FROM CorrespondanceAnalytique
        WHERE idcorrespondance = @id
    `
}