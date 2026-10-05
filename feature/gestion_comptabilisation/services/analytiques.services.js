const { db, sql, connectInstance, connectDB } = require("../../../config/db");

async function appliquerAnalytique(lignesjournal, paramcomptable, transaction){

    if (paramcomptable[0].axesecond !== 1) {
        return lignesjournal;
    }

    if (paramcomptable[0].analytiquesite === 1 && paramcomptable[0].analytiquetable != 1) {
        return await appliquerAnalytiqueSite(lignesjournal, transaction);
    }

    if (paramcomptable[0].analytiquetable === 1 && paramcomptable.analytiquesite != 1) {
        return await appliquerAnalytiqueCorrespondance(lignesjournal, transaction);
    }

    if (paramcomptable[0].analytiquetable === 1 && paramcomptable[0].analytiquesite === 1) {
        throw new Error("Un seul mode analytique peut être actif.");
    }

    return lignesjournal;
}

async function appliquerAnalytiqueSite(lignesjournal, transaction){
    for (const ligne of lignesjournal) {
        if (!ligne.idsite) {
            throw new Error(`Site absent sur la ligne ${ligne.numligne}`);
        }

        const compte = await checkCompteVentillable(ligne, transaction);

        const result = await transaction.request()
            .input("idsite",sql.UniqueIdentifier,ligne.idsite)
            .query(`
                SELECT
                    idcentreanalytique,
                    estcentreanalytique,
                    codesite
                FROM Site
                WHERE idsite = @idsite
            `);

        if (!result.recordset.length) {
            throw new Error(`Site introuvable : ${ligne.idsite}`);
        }

        const site = result.recordset[0];

        if (!site.idcentreanalytique) {
            throw new Error(`Aucun centre analytique défini pour le site ${ligne.idsite}`);
        }

        const result2 = await transaction.request()
            .input("idcentreanalytique", sql.UniqueIdentifier, site.idcentreanalytique)
            .query(`
                SELECT
                    idcentreanalytique,
                    codecentreanalytique
                FROM CentreAnalytique
                WHERE idcentreanalytique = @idcentreanalytique
            `);

        if (!result2.recordset.length) {
            throw new Error(`Analytique introuvable : ${site.codesite}`);
        }

        const centre = result2.recordset[0];

        if (!site.idcentreanalytique) {
            throw new Error(`Aucun centre analytique défini pour le site ${site.codesite}`);
        }

        if(compte){
            ligne.idcentreanalytiquesecond = site.idcentreanalytique;
            ligne.centreanalytiquesecond = centre.codecentreanalytique;
        }
    }

    return lignesjournal;
}

async function appliquerAnalytiqueCorrespondance(lignesjournal, transaction) {

    for (const ligne of lignesjournal) {
        if(await checkCompteVentillable(ligne, transaction)){
            if (!ligne.idcentreanalytique) {
                throw new Error(`Centre analytique absent sur la ligne ${ligne.numligne}`);
            }

            const result = await transaction.request()
                .input("idcentreanalytique", sql.UniqueIdentifier, ligne.idcentreanalytique)
                .query(`
                    SELECT
                        correspondance
                    FROM CorrespondanceAnalytique
                    WHERE idcentreanalytique = @idcentreanalytique
                `);

            if (!result.recordset.length) {
                throw new Error(`Aucune correspondance trouvée pour le centre analytique ${ligne.centreanalytique}`);
            }

            ligne.centreanalytiquesecond = result.recordset[0].correspondance;
        }
    }

    return lignesjournal;
}

async function checkCompteVentillable(ligne , transaction){
    if (!ligne.idcompte) {
        throw new Error(`Compte général absent sur la ligne ${ligne.numligne}`);
    }

    const result = await transaction.request()
        .input("idcompte", sql.UniqueIdentifier, ligne.idcompte)
        .query(`
            SELECT
                idcompte, numcompte, ventillable
            FROM PlanComptable
            WHERE idcompte = @idcompte
        `);

    if (!result.recordset.length) {
        throw new Error(`Aucun compte trouvée ${ligne.compte}`);
    }
    
    const compte = result.recordset[0];
    
    if(compte.ventillable == 1){
        return true;
    }else {
        return false
    }

}


module.exports = {
    appliquerAnalytique,
    appliquerAnalytiqueSite,
    appliquerAnalytiqueCorrespondance,
    checkCompteVentillable
}