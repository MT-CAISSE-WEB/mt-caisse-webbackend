module.exports = {
    initvalidationBudget: `
        INSERT INTO ValidationBudget
        (idbudget, idcircuitvalidation, idcircuitetape, idutilisateur, decision, rang)
        OUTPUT INSERTED.*
        VALUES (@idbudget, @idcircuitvalidation ,@idcircuitetape ,@idutilisateur , 'en attente', @rang)
    `,
    circuitValidateur: `
        Select VB.*,
            U.nom,
            U.prenom,
            CI.codecircuitvalidation,
            B.codebudget
        from ValidationBudget VB
            LEFT JOIN Budget B ON B.idbudget = VB.idbudget
            LEFT JOIN Utilisateur U ON U.idutilisateur = VB.idutilisateur
            LEFT JOIN CircuitValidation CI ON CI.idcircuitvalidation = VB.idcircuitvalidation
        Where VB.idbudget = @idbudget
        ORDER BY VB.rang ASC;
    `,
    getBudgetById: `
        Select * from Budget Where idbudget = @idbudget
    `,
    checkRight : `
        SELECT 1
        FROM ValidationBudget
        WHERE idbudget = @idbudget
            AND rang = @niveauactuel
            AND idutilisateur = @iduser
            AND decision = 'en attente' OR decision = 'complement'
    `,
    saveDecision : `
        UPDATE ValidationBudget
        SET decision = @decision,
            commentaire = @commentaire,
            datevalidation = GETDATE()
        WHERE idbudget = @idbudget
        AND idutilisateur = @iduser
    `,
    dernierNiveau: `
        SELECT MAX(rang) AS dernierRang
        FROM ValidationBudget
        WHERE idbudget = @idbudget and idcircuitvalidation = @idcircuit;
    `,
    updateStatut : `
        UPDATE Budget
        SET valide = @valide
        WHERE idbudget = @idbudget
    `,
     niveauActuel: `
        UPDATE Budget
        SET niveauactuel = niveauactuel + 1
        WHERE idbudget = @idbudget
    `,
    circuitvalidation: `
        Select *  from CircuitValidation where idcircuitvalidation = @idcircuit
    `,
    updateCircuit : `
        UPDATE Budget
        SET valide = @valide, idcircuitvalidation = @idcircuit, niveauactuel = @niveauactuel
        OUTPUT INSERTED.*
        WHERE idbudget = @idbudget
    `,
    circuitBudget: `
        Select CV.*
        From CircuitValidation CV
        Where CV.typeaction = 'budget' 
        AND CV.actif = 1 
        AND CV.typeentite = 'societe'
        AND CV.idsociete = @idsociete
    `,
     updateBudgetSite : `
        UPDATE Budget
        SET validesite = @validesite, datevalidesite = @datevalidesite
        WHERE idbudget = @idbudget
    `,
    updateBudgetSociete : `
        UPDATE Budget
        SET validesociete = @validesociete, datevalidesociete = @datevalidesociete
        WHERE idbudget = @idbudget
    `,
}