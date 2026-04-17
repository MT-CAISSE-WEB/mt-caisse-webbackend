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

            pc.urldossier

        FROM ParametreComptable pc

        LEFT JOIN Societe s 
            ON pc.idsociete = s.idsociete

        LEFT JOIN Journal j 
            ON pc.idjournal = j.idjournal

        LEFT JOIN PlanComptable c 
            ON pc.idcompte = c.idcompte

        WHERE pc.idsociete = @idsociete;
    `
}