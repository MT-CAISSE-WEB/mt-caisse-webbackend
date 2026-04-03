module.exports = function decaissementajRule(enteteoperation, typeoperation, ligneoperation) {

    let result = [];

    // 1. Filtrer les lignes valides
    const lignes = ligneoperation[0].filter(l =>
        l && l.montantoperation > 0 &&
        (l.comptabilise === 0 || l.comptabilise === null)
    );


    if (lignes.length === 0) {
        throw new Error("Aucune ligne à justifier");
    }

    const mouvement = typeoperation.flat();

    if (!mouvement.length) {
        throw new Error("Aucun mouvement trouvé");
    }


    // ===============================
    // 🧩 1. DECAISSEMENT A JUSTIFIER
    // ===============================
    // 421XXX (débit)
    result.push({
        idcompte: m.compte_attente_id, // ⚠️ à configurer
        compte: '421XXX',

        idjournal: m.idjournal,
        journal: m.codejournal,

        debit: totalDecaissement,
        credit: 0,

        iddevise: m.caisse_iddevise,
        devise: m.codedevise,

        montantdevise: totalDecaissement,
        taux: m.taux || 1,
        montantref: totalDecaissement * (m.taux || 1),

        etat: 'en attente',
        numligne: result.length + 1,
        typeecriture: 'attente'
    });

    // caisse (crédit)
    result.push({
        idcompte: m.idcompte,
        compte: m.numcompte,

        idjournal: m.idjournal,
        journal: m.codejournal,

        debit: 0,
        credit: totalDecaissement,

        iddevise: m.caisse_iddevise,
        devise: m.codedevise,

        montantdevise: totalDecaissement,
        taux: m.taux || 1,
        montantref: totalDecaissement * (m.taux || 1),

        etat: 'en attente',
        numligne: result.length + 1,
        typeecriture: 'caisse'
    });

    // ===============================
    // 🧩 2. JUSTIFICATION (charges)
    // ===============================

    for (const l of lignes) {

        // charge (débit)
        result.push({
            idligneoperation: l.idligneoperation,

            idcompte: l.compte_id,
            compte: l.numcompte,

            idjournal: m.idjournal,
            journal: m.codejournal,

            idcentreanalytique: l.centre_id,
            centreanalytique: l.centre_libelle,

            idtiers: l.tiers_id,
            tiers: l.tiers_designation,

            debit: l.montantoperation,
            credit: 0,

            iddevise: m.caisse_iddevise,
            devise: m.codedevise,

            montantdevise: l.montantoperation,
            taux: 1,
            montantref: l.montantoperation,

            etat: 'en attente',
            numligne: result.length + 1,
            typeecriture: 'charge'
        });
    }

    // 421XXX (crédit) = total justifié
    result.push({
        idcompte: m.compte_attente_id,
        compte: '421XXX',

        idjournal: m.idjournal,
        journal: m.codejournal,

        debit: 0,
        credit: totalJustifie,

        iddevise: m.caisse_iddevise,
        devise: m.codedevise,

        montantdevise: totalJustifie,
        taux: 1,
        montantref: totalJustifie,

        etat: 'en attente',
        numligne: result.length + 1,
        typeecriture: 'justification'
    });

    // ===============================
    // 🧩 3. RETOUR CAISSE (reste)
    // ===============================

    if (reste > 0) {

        // caisse (débit)
        result.push({
            idcompte: m.idcompte,
            compte: m.numcompte,

            idjournal: m.idjournal,
            journal: m.codejournal,

            debit: reste,
            credit: 0,

            iddevise: m.caisse_iddevise,
            devise: m.codedevise,

            montantdevise: reste,
            taux: 1,
            montantref: reste,

            etat: 'en attente',
            numligne: result.length + 1,
            typeecriture: 'retour'
        });

        // 421XXX (crédit)
        result.push({
            idcompte: m.compte_attente_id,
            compte: '421XXX',

            idjournal: m.idjournal,
            journal: m.codejournal,

            debit: 0,
            credit: reste,

            iddevise: m.caisse_iddevise,
            devise: m.codedevise,

            montantdevise: reste,
            taux: 1,
            montantref: reste,

            etat: 'en attente',
            numligne: result.length + 1,
            typeecriture: 'retour'
        });
    }

    // ===============================
    // ✅ CONTROLE FINAL
    // ===============================

    const totalDebit = result.reduce((s, l) => s + (l.debit || 0), 0);
    const totalCredit = result.reduce((s, l) => s + (l.credit || 0), 0);

    if (totalDebit !== totalCredit) {
        throw new Error(`Ecriture déséquilibrée D=${totalDebit} C=${totalCredit}`);
    }

    return result;
};
