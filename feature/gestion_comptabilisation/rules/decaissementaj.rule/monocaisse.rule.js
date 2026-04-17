module.exports = function monocaisseRule(mouvement,lignes){
    let result = [];
     // ===============================
        // 1. DECAISSEMENT A JUSTIFIER
        // ===============================
        result.push({
        idcompte: mouvement[0].compte_id,
        compte: mouvement[0].numcompte,

        idtypeoperation : mouvement[0].idtypeoperation,
        codtypeoperation : mouvement[0].codtypeoperation,

        idjournal: mouvement[0].idjournal,
        journal:    mouvement[0].codejournal,

        debit: 0,
        credit:mouvement[0].montant,

        iddevise: mouvement[0].devise_id,
        devise: mouvement[0].codedevise,

        idcentreanalytique :  mouvement[0].centre_id,
        centreanalytique :  mouvement[0].codecentreanalytique,

        idtiers :  mouvement[0].tiers_id,
        tiers :  mouvement[0].codetiers,


        montantdevise: mouvement[0].montant,
        taux: 1,
        montantref:  mouvement[0].montantref,

        etat: 'simulation',
        numligne: result.length + 1,
        typeecriture: 'attente'

  
    });

    for (const l of lignes) {
        result.push({
        idcompte: '7674BA29-6F90-4857-B141-051E986F0929',
        compte: '421003',

        idtypeoperation : mouvement[0].idtypeoperation,
        codtypeoperation : mouvement[0].codtypeoperation,

        idligneoperation : l.idligneoperation,
        idoperation : l.idoperation,

        idnature : l.idnature,
        codnature : l.nature_code,
   
        idjournal: mouvement[0].idjournal,
        journal:    mouvement[0].codejournal,

        debit: l.montantoperation,
        credit: 0,

        iddevise: mouvement[0].devise_id,
        devise: mouvement[0].codedevise,

        idcentreanalytique :  l.centre_id,
        centreanalytique :  l.codecentreanalytique,

        idtiers :  l.tiers_id,
        tiers :  l.codetiers,


        montantdevise: l.montantoperation,
        taux: 1,
        montantref:  l.montantoperation,

        etat: 'simulation',
        numligne: result.length + 1,
        typeecriture: 'attente'
        
        });
    }

    const totalDebit = result.reduce((s, l) => s + (l.debit || 0), 0);
    const totalCredit = result.reduce((s, l) => s + (l.credit || 0), 0);

    if (totalDebit !== totalCredit) {
        throw new Error(`Ecriture déséquilibrée D=${totalDebit} C=${totalCredit}`);
    }

    return result;

}