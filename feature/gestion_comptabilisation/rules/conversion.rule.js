module.exports = function conversionRule(enteteoperation, typeoperation, ligneoperation,paramcomptable) {

    let result = [];


    const lignes = ligneoperation[0].filter(l =>
        l && l.montantoperation > 0 &&
        (l.comptabilise === 0 || l.comptabilise === null)
    );

    if (!lignes.length) throw new Error("Aucune ligne valide");

    const mouvements = typeoperation.flat();
    if (!mouvements.length) throw new Error("Aucun mouvement");

    // 1. Mouvement de référence (taux = 1)
    const base = mouvements.find(m => m.taux === 1);
    if (!base) throw new Error("Aucune caisse de référence (taux=1)");

    // Total charges
    const totalCharges = lignes.reduce((s, l) => s + l.montantoperation, 0);


    // ==============================
    // CHARGES
    // ==============================
    for (const l of lignes) {

        result.push({
            idligneoperation : l.idligneoperation,
            idcompte: l.compte_id,
            compte: l.numcompte,

            idnature : l.nature_id,
            codenature : l.nature_code,
            libellenature : l.nature_libelle,

            idjournal: base.idjournal,
            journal: base.codejournal,

            debit: base.codtypeoperation === 'decaissement' ? l.montantoperation : 0,
            credit: base.codtypeoperation === 'encaissement' ? l.montantoperation : 0,

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

    // ==============================
    // TRANSIT (différence)
    // ==============================
    const reste = totalCharges - base.montant;

    if (reste > 0) {

        //Sortie en devise de base (CDF)
        result.push({
           idcompte:paramcomptable.idcompte,
            compte:paramcomptable.numcompte,

            idjournal: base.idjournal,
            journal: base.codejournal,

            idtypeoperation : base.idtypeoperation,
            codtypeoperation : base.codtypeoperation,

            debit: 0,
            credit: reste,

            idcentreanalytique :  base.centre_id,
            centreanalytique :  base.codecentreanalytique,

            idtiers :  base.tiers_id,
            tiers :  base.codetiers,

            iddevise: base.caisse_iddevise,
            devise: base.codedevise,

            montantdevise: reste,
            taux: 1,
            montantref: reste,

            etat: 'en attente',
            numligne: result.length + 1,
            typeecriture: 'transit'
        });


        // ==============================
        // AUTRES CAISSES (conversion)
        // ==============================
        const autres = mouvements.filter(m => m.taux !== 1);

  

        for (const m of autres) {

            const montantDevise = reste / m.taux;

            console.log(m);
            con;

            // Entrée transit en devise cible
            result.push({
                idcompte:paramcomptable.idcompte,
                compte:paramcomptable.numcompte,

                idjournal: m.idjournal,
                journal: m.codejournal,

                debit: montantDevise,
                credit: 0,

                idtypeoperation : m.idtypeoperation,
                codtypeoperation :m.codtypeoperation,

                idcentreanalytique :  m.centre_id,
                centreanalytique :   m.codecentreanalytique,

                idtiers :   m.tiers_id,
                tiers :   m.codetiers,

                iddevise: m.caisse_iddevise,
                devise: m.codedevise,

                montantdevise: montantDevise,
                taux: m.taux,
                montantref: reste,

                etat: 'en attente',
                numligne: result.length + 1,
                typeecriture: 'transit'
            });

            // Caisse cible
            result.push({
                idcompte: m.idcompte,
                compte: m.numcompte,

                idjournal: m.idjournal,
                journal: m.codejournal,

                idtypeoperation : m.idtypeoperation,
                codtypeoperation :m.codtypeoperation,

                idcentreanalytique :  m.centre_id,
                centreanalytique :   m.codecentreanalytique,

                idtiers :   m.tiers_id,
                tiers :   m.codetiers,

                debit: 0,
                credit: montantDevise,

                iddevise: m.caisse_iddevise,
                devise: m.codedevise,

                montantdevise: montantDevise,
                taux: m.taux,
                montantref: reste,

                etat: 'en attente',
                numligne: result.length + 1,
                typeecriture: 'caisse'
            });
        }
    }
    
    return result;
};