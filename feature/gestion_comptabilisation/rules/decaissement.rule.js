module.exports = function decaissementRule(enteteoperation,typeoperation, ligneoperation,paramcomptable) {
    let result = [];
    let total = 0; 
 
    const lignes = ligneoperation[0].filter(l => l && l.montantoperation > 0 && (l.comptabilise === 0 || l.comptabilise === null));

    

    if (lignes.length === 0) {
        throw new Error("Aucune ligne valide à comptabiliser");
    }

 
    
    result.push({
        idtypeoperation : typeoperation[0][0].idtypeoperation,
        typeoperation : typeoperation[0][0].codtypeoperation,
        idcompte : typeoperation[0][0].idcompte,
        compte : typeoperation[0][0].numcompte,

        idjournal : typeoperation[0][0].idjournal,
        journal : typeoperation[0][0].codejournal,

        idnature : null,
        codenature : null,
        libellenature : null,

        idcentreanalytique : null,
        centreanalytique : null,

        idtiers : null,
        tiers : null,

        credit : typeoperation[0][0].montant,
        debit : 0,
        etat : 'en attente',
        
        iddevise : typeoperation[0][0].caisse_iddevise,
        devise : typeoperation[0][0].codedevise,
        montantdevise : typeoperation[0][0].montant,
        taux : typeoperation[0][0].taux,
        montantref : typeoperation[0][0].montantref,
        numligne : 1,
        typeecriture : 'simulation',
        date : enteteoperation.dateoperation,
        libelle_ecriture : lignes[0].libelle

    })


    for (const l of ligneoperation[0]){
        total += l.montantoperation;

        result.push({
        idligneoperation : l.idligneoperation,
        idtypeoperation : typeoperation[0][0].idtypeoperation,
        typeoperation : typeoperation[0][0].codtypeoperation,

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

        credit : 0,
        debit : l.montantoperation,
        etat : 'en attente',
        
        iddevise : typeoperation[0][0].caisse_iddevise,
        devise : typeoperation[0][0].codedevise,
        montantdevise : l.montantoperation,
        taux : null,
        montantref :null,
        numligne : result.length + 1,
        typeecriture : 'simulation',
        date : enteteoperation.dateoperation,
        libelle_ecriture : l.libelle
         
        })
    }

    return result;
}