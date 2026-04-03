module.exports = function transfertRule(enteteoperation,typeoperation, ligneoperation) {
    let result = [];
    let total = 0;

     const lignes = ligneoperation[0].filter(l => l && l.montantoperation > 0 && (l.comptabilise === 0 || l.comptabilise === null));

    if (lignes.length === 0) {
        throw new Error("Aucune ligne valide à comptabiliser");
    }

    const mouvement = typeoperation.flat();
    if (!mouvement.length) {
        throw new Error("Aucun mouvement de caisse");
    }

    const totalcharge = lignes.reduce((sum, l) => sum + l.montantoperation, 0);

    //lignes de charges 
      for (const l of lignes) {
        result.push({
            idtypeoperation : l.idtypeoperation,
            typeoperation : l.codtypeoperation,
            idcompte : l.idcompte,
            compte : l.numcompte,

            idjournal : mouvement[0].idjournal,
            journal : mouvement.codejournal,

            idcentreanalytique : l.centre_id,
            centreanalytique : l.numcompte,

            idtiers : l.idtiers,
            tiers : l.tiers,

            credit :0, 
            debit : l.montantoperation,
            etat : 'en attente',
            
            iddevise: mouvement[0].caisse_iddevise,
            devise: mouvement[0].codedevise,

            montantdevise: l.montantoperation,
            taux: 1,
            montantref: l.montantoperation,

            numligne: result.length + 1,
            typeecriture: 'simulation'

    })
}

//lignes de caises 
 let totalSortie = 0;
 let totalEntree = 0;

 for (const m of mouvement) {
    const montant = m.montant;

    if (!montant || montant <= 0) continue;

    if (m.codtypeoperation === 'decaissement') {
         totalSortie += montant;
          result.push({
                idcompte: m.idcompte,
                compte: m.numcompte,

                idjournal: m.idjournal,
                journal: m.codejournal,

                debit: 0,
                credit: montant,

                iddevise: m.caisse_iddevise,
                devise: m.codedevise,

                montantdevise: montant,
                taux: m.taux || 1,
                montantref: montant * (m.taux || 1),

                etat: 'en attente',

                numligne: result.length + 1,
                typeecriture: 'normale'
            });
    }
    else if (m.codtypeoperation === 'encaissement') {
         totalEntree += montant;
          result.push({
                idcompte: m.idcompte,
                compte: m.numcompte,

                idjournal: m.idjournal,
                journal: m.codejournal,

                debit: montant,
                credit: 0,

                iddevise: m.caisse_iddevise,
                devise: m.codedevise,

                montantdevise: montant,
                taux: m.taux || 1,
                montantref: montant * (m.taux || 1),

                etat: 'en attente',

                numligne: result.length + 1,
                typeecriture: 'normale'
            });
 }

}

 const totalDebit = result.reduce((s, l) => s + (l.debit || 0), 0);
 const totalCredit = result.reduce((s, l) => s + (l.credit || 0), 0);

  const ecart = totalDebit - totalCredit;

  if (ecart !== 0) {

        result.push({
            idcompte: "COMPTE_ECART", // à configurer
            compte: "471000",

            idjournal: mouvements[0].idjournal,
            journal: mouvements[0].codejournal,

            debit: ecart < 0 ? Math.abs(ecart) : 0,
            credit: ecart > 0 ? ecart : 0,

            iddevise: mouvements[0].caisse_iddevise,
            devise: mouvements[0].codedevise,

            montantdevise: Math.abs(ecart),
            taux: 1,
            montantref: Math.abs(ecart),

            etat: 'validee',

            numligne: result.length + 1,
            typeecriture: 'ecart'
        });
    }

    return result;
};


