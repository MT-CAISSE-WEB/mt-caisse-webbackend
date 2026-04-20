module.exports = function multicaissesRule(mouvements, lignes) {

    let result = [];

    const base = mouvements.find(m => m.taux === 1);
    if (!base) throw new Error("Aucune caisse de référence (taux=1)");

    // Total charges
    const totalCharges = lignes.reduce((s, l) => s + l.montantoperation, 0);

     for (const l of lignes) {

        result.push({
            idligneoperation : l.idligneoperation,
            idcompte: l.compte_id,
            compte: l.numcompte,

            idjournal: base.idjournal,
            journal: base.codejournal,

            debit: base.codtypeoperation === 'decaissementaj' ? l.montantoperation : 0,
            credit: base.codtypeoperation === 'encaissementaj' ? l.montantoperation : 0,

            idcentreanalytique : l.centre_id,
            centreanalytique : l.codecentreanalytique,

            idtiers : l.tiers_id,
            tiers : l.codetiers,

            iddevise: base.caisse_iddevise,
            devise: base.codedevise,

            montantdevise: l.montantoperation,
            taux: 1,
            montantref: l.montantoperation,

            etat: 'en attente',
            numligne: result.length + 1,
            typeecriture: 'charge'
        });
    }

     // ==============================
    // CAISSE PRINCIPALE
    // ==============================
    result.push({
        idcompte: base.idcompte,
        compte: base.numcompte,

        idjournal: base.idjournal,
        journal: base.codejournal,

        idtypeoperation : base.idtypeoperation,
        codtypeoperation : base.codtypeoperation,

        debit: 0,
        credit: base.montant,

        idcentreanalytique :  base.centre_id,
        centreanalytique :  base.codecentreanalytique,

        idtiers :  base.tiers_id,
        tiers :  base.codetiers,

        iddevise: base.caisse_iddevise,
        devise: base.codedevise,

        montantdevise: base.montant,
        taux: 1,
        montantref: base.montant,

        etat: 'en attente',
        numligne: result.length + 1,
        typeecriture: 'caisse'
    });
}