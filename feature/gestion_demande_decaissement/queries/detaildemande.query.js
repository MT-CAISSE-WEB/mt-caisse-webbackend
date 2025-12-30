module.exports = {
    getAll : ``,
    insert : `
          INSERT INTO DetailsDemande (
            iddetailsdemande, iddemande, idlignedemande,
            idsociete, description, quantite, montant,
            createdat, createdby
          )
          OUTPUT INSERTED.*
          VALUES (
            @iddetailsdemande, @iddemande, @idlignedemande,
            @idsociete, @description, @quantite, @montant,
            @createdat, @createdby
          )
    `,
    update : `
        UPDATE DetailsDemande
        SET description = @description,
            quantite = @quantite,
            montant = @montant,
            updatedat = @updatedat,
            updatedby = @updatedby
        WHERE iddetailsdemande = @iddetailsdemande
    `,
    delete : `
        DELETE FROM DetailsDemande
        WHERE iddetailsdemande = @iddetailsdemande
    `,
    getDetailByLigne : `
        SELECT *
        FROM DetailsDemande
        WHERE idlignedemande = @idlignedemande
        ORDER BY createdat
    `,
    getDetailByDemande : `
        SELECT *
        FROM DetailsDemande
        WHERE iddemande = @iddemande
        ORDER BY createdat
    `,
    getOne : `
        SELECT *
        FROM DetailsDemande
        WHERE iddetailsdemande = @iddetailsdemande
      `
}