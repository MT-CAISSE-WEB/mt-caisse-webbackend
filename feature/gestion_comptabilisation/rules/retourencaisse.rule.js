module.exports = function retourencaisseRule(enteteoperation,typeoperation, ligneoperation,paramcomptable) {
    let result = [];
    let total = 0; 

    const lignes = ligneoperation[0].filter(l => l && l.montantoperation > 0);

    if (lignes.length === 0) {
        throw new Error("Aucune ligne valide à comptabiliser");
    }

    result.push({
        idtypeoperation : typeoperation[0][0].idtypeoperation,
        typeoperation : typeoperation[0][0].codtypeoperation,
        libelle : ligneoperation[0][0].libelle,
        
        idcompte : typeoperation[0][0].idcompte,
        compte : typeoperation[0][0].numcompte,
       

        idjournal : typeoperation[0][0].idjournal,
        journal : typeoperation[0][0].codejournal,

        idcentreanalytique : null,
        centreanalytique : null,

        idnature : null,
        codenature : null,
        libellenature : null,

        idtiers : null,
        tiers : null,

        credit :0, 
        debit : typeoperation[0][0].montant,
        etat : 'en attente',
        
        iddevise : typeoperation[0][0].caisse_iddevise,
        devise : typeoperation[0][0].codedevise,
        montantdevise : typeoperation[0][0].montant,
        taux : typeoperation[0][0].taux,
        montantref : typeoperation[0][0].montantref,
        numligne : 1,
        typeecriture : 'caisse',
        date : typeoperation[0][0].createdat
    })

    for (const l of ligneoperation[0]){
        total += l.montantoperation;

        result.push({
        idligneoperation : l.idligneoperation,
        idtypeoperation : typeoperation[0][0].idtypeoperation,
        typeoperation : typeoperation[0][0].codtypeoperation,
        libelle : l.libelle,

        idnature : l.idnature,
        codenature : l.nature_code,
        libellenature : l.nature_libelle,

        idcompte : l.compte_id,
        compte : l.numcompte,

        idjournal : typeoperation[0][0].idjournal,
        journal : typeoperation[0][0].codejournal,

        idcentreanalytique : l.centre_id,
        centreanalytique : l.codecentreanalytique,

        idtiers : l.tiers_id,
        tiers : l.codetiers,

        credit : typeoperation[0][0].montant,
        debit : 0,
        etat : 'en attente',
        
        iddevise : typeoperation[0][0].caisse_iddevise,
        devise : typeoperation[0][0].codedevise,
        montantdevise : typeoperation[0][0].montant,
        taux : typeoperation[0][0].taux,
        montantref : typeoperation[0][0].montantref,
        numligne : result.length + 1,
        typeecriture : 'caisse',
        date : typeoperation[0][0].createdat
      })
    }

    return result;
}