module.exports = {
    insert : `
        INSERT INTO ModeleCompteur (idmodelecompteur, codemodelecompteur, libelle, typedocument, sequence_1,
            prefixe_1, sequence_2, prefixe_2, createdby )
        VALUES (@idmodelecompteur, @codemodelecompteur, @libelle, @typedocument, @sequence_1, @prefixe_1,
            @sequence_2, @prefixe_2, @createdby) ;
    `,
    getall : ` SELECT * FROM ModeleCompteur ORDER BY createdat DESC; `,
    getone : `SELECT * FROM ModeleCompteur WHERE idmodelecompteur = @idmodelecompteur; `,
    update : `
        UPDATE ModeleCompteur SET
            libelle   = @libelle,
            typedocument  = @typedocument,
            sequence_1    = @sequence_1,
            prefixe_1     = @prefixe_1,
            sequence_2    = @sequence_2,
            prefixe_2     = @prefixe_2,
            updatedat     = GETDATE(),
            updatedby     = @updatedby
        WHERE idmodelecompteur = @idmodelecompteur;
    `,
    delete : `DELETE FROM ModeleCompteur WHERE idmodelecompteur = @idmodelecompteur; `
}