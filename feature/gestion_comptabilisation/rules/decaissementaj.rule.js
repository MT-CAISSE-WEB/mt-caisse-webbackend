const monocaisseRule = require('./decaissementaj.rule/monocaisse.rule');
const multicaissesRule = require('./decaissementaj.rule/multicaisse.rule');

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


    //test si multiples mouvements
    if (mouvement.length > 1) {
         result = multicaissesRule(mouvement,lignes);
    }
    else {
       result = monocaisseRule(mouvement,lignes);
    }

    return result;

};
