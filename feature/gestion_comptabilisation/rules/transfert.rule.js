module.exports = function multiCaisseRule(
    enteteoperation,
    typeoperation,
    ligneoperation,
    paramcomptable
) {

    let result = [];

    const lignes = ligneoperation[0].filter(l =>
        l && l.montantoperation > 0 &&
        (l.comptabilise === 0 || l.comptabilise === null)
    );

    if (!lignes.length) {
        throw new Error("Aucune ligne valide");
    }

    const mouvements = typeoperation.flat();
    if (!mouvements.length) {
        throw new Error("Aucun mouvement");
    }

    const type = mouvements[0].codtypeoperation;

    const isDecaissement = type.includes('decaissement');
    const isEncaissement = type.includes('encaissement');

    if (!isDecaissement && !isEncaissement) {
        throw new Error("Type d'opération non supporté");
    }

    // ==============================
    // TOTAL GLOBAL
    // ==============================
    const total = lignes.reduce((sum, l) => sum + l.montantoperation, 0);

    // ==============================
    // CHARGE / PRODUIT (UNE SEULE LIGNE)
    // ==============================
    const ref = lignes[0];

    result.push({
        idcompte: ref.compte_id,
        compte: ref.numcompte,

        idnature: ref.nature_id,
        libellenature: ref.nature_libelle,

        idjournal: mouvements[0].idjournal,
        journal: mouvements[0].codejournal,

        debit: isDecaissement ? total : 0,
        credit: isEncaissement ? total : 0,

        idcentreanalytique: ref.centre_id,
        centreanalytique: ref.codecentreanalytique,

        idtiers: ref.tiers_id,
        tiers: ref.codetiers,

        iddevise: mouvements[0].caisse_iddevise,
        devise: mouvements[0].codedevise,

        montantdevise: total,
        taux: 1,
        montantref: total,

        etat: 'en attente',
        numligne: result.length + 1,
        typeecriture: 'charge',
        date : enteteoperation.dateoperation
    });

    // ==============================
    // CAISSES (RÉPARTITION)
    // ==============================
    let totalCaisses = 0;

    for (const m of mouvements) {

        if (!m.montant || m.montant <= 0) continue;

        totalCaisses += m.montant;

        result.push({
            idcompte: m.idcompte,
            compte: m.numcompte,

            idjournal: m.idjournal,
            journal: m.codejournal,

            debit: isEncaissement ? m.montant : 0,
            credit: isDecaissement ? m.montant : 0,

            idcentreanalytique: m.centre_id,
            centreanalytique: m.codecentreanalytique,

            idtiers: m.tiers_id,
            tiers: m.codetiers,

            iddevise: m.caisse_iddevise,
            devise: m.codedevise,

            montantdevise: m.montant,
            taux: 1,
            montantref: m.montant,

            etat: 'en attente',
            numligne: result.length + 1,
            typeecriture: 'caisse',
            date : enteteoperation.dateoperation
        });
    }

    // ==============================
    // CONTRÔLE
    // ==============================
    if (totalCaisses !== total) {
        throw new Error(
            `Déséquilibre : total charges = ${total}, total caisses = ${totalCaisses}`
        );
    }

    return result;
};


