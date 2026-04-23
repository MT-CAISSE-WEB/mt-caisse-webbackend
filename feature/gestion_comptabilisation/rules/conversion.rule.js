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
    //const base = mouvements.find(m => m.taux === 1);
    const base_1 = mouvements.find(m => m.caisse_iddevise === enteteoperation.iddevise);
    const base_2 = mouvements.find(m => m.caisse_iddevise !== enteteoperation.iddevise);
    if (!base_1) throw new Error("Aucune caisse de référence");

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

            idjournal: base_1.idjournal,
            journal: base_1.codejournal,

            debit: base_1.codtypeoperation === 'decaissement' || 'decaissementaj' ? l.montantoperation : 0,
            credit: base_1.codtypeoperation === 'encaissement' ? l.montantoperation : 0,

            idcentreanalytique : l.centre_id,
            centreanalytique : l.codecentreanalytique,

            idtiers : l.tiers_id,
            tiers : l.codetiers,

            iddevise: base_1.caisse_iddevise,
            devise: base_1.codedevise,

            montantdevise: l.montantoperation,
            taux: 1,
            montantref: l.montantoperation,

            etat: 'en attente',
            numligne: result.length + 1,
            typeecriture: 'charge',
            date : enteteoperation.dateoperation
        });
    }

    // ==============================
    // CAISSE PRINCIPALE
    // ==============================
    result.push({
        idcompte: base_1.idcompte,
        compte: base_1.numcompte,

        idjournal: base_1.idjournal,
        journal: base_1.codejournal,

        idtypeoperation : base_1.idtypeoperation,
        codtypeoperation : base_1.codtypeoperation,

        debit: 0,
        credit: base_1.montant,

        idcentreanalytique :  base_1.centre_id,
        centreanalytique :  base_1.codecentreanalytique,

        idtiers :  base_1.tiers_id,
        tiers :  base_1.codetiers,

        iddevise: base_1.caisse_iddevise,
        devise: base_1.codedevise,

        montantdevise: base_1.montant,
        taux: 1,
        montantref: base_1.montant,

        etat: 'en attente',
        numligne: result.length + 1,
        typeecriture: 'caisse',
        date : enteteoperation.dateoperation
    });
     
    // ==============================
    // TRANSIT (différence)
    // ==============================
    const reste = totalCharges - base_1.montant;

    if (reste > 0) {
        //Sortie en devise de base (CDF)
        result.push({
            idcompte:paramcomptable[0].idcompte,
            compte:paramcomptable[0].numcompte,

            idjournal: base_1.idjournal,
            journal: base_1.codejournal,

            idtypeoperation : base_1.idtypeoperation,
            codtypeoperation : base_1.codtypeoperation,

            debit: 0,
            credit: reste,

            idcentreanalytique :  base_1.centre_id,
            centreanalytique :  base_1.codecentreanalytique,

            idtiers :  base_1.tiers_id,
            tiers :  base_1.codetiers,

            iddevise: base_1.caisse_iddevise,
            devise: base_1.codedevise,

            montantdevise: reste,
            taux: 1,
            montantref: reste,

            etat: 'en attente',
            numligne: result.length + 1,
            typeecriture: 'transit',
            date : enteteoperation.dateoperation
        });
    
        // ==============================
        // AUTRES CAISSES (conversion)
        // ==============================
        const autres = mouvements.filter(m => m.caisse_iddevise !== enteteoperation.iddevise);

        for (const m of autres) {
           let montantDevise=0;
            if(m.taux === 1 ){
                montantDevise = base_2.montantref;
            }
            else{
                montantDevise = base_2.montant;
            }

            // Entrée transit en devise cible
            result.push({
                idcompte:paramcomptable[0].idcompte,
                compte:paramcomptable[0].numcompte,

                idjournal: m.idjournal,
                journal: m.codejournal,

                debit:montantDevise,
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
                montantref: m.montantref,

                etat: 'en attente',
                numligne: result.length + 1,
                typeecriture: 'transit',
                date : enteteoperation.dateoperation
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
                typeecriture: 'caisse',
                date : enteteoperation.dateoperation
            });
        }

    
    }

    return result;
};