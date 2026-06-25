const { connectDB } = require('../../../config/db');
const sql = require('mssql');
const { operationQueries } = require('../queries/queryIndex');
const PaginationModel = require('../../../shared/utils/model');

async function journalPaiement(datedebut, datefin, caisse, idsite, typeentitesociete){
    const pool = await connectDB();

    try {
        const result = await pool.request()
            .input('idsite', sql.UniqueIdentifier, idsite)
            .input('typeentitesociete', sql.Int, typeentitesociete)
            .input('datedebut', sql.Date, datedebut || null)
            .input('datefin', sql.Date, datefin || null)
            .input('idcaisse', sql.UniqueIdentifier, caisse || null)
            .query(operationQueries.journalpaiement);

        const resultat = result.recordset;
        const map = new Map();
        resultat.forEach(r => {

            const date = r.date_operation.toISOString().split('T')[0];
            const site = r.site;
            const codesite = r.codesite;
            const caisseKey = r.caisse;

            // Niveau DATE
            if (!map.has(date)) {
                map.set(date, {
                    date,
                    codesite,
                    site,
                    caisses: new Map()
                });
            }

            const dateGroup = map.get(date);

            // Niveau CAISSE
            if (!dateGroup.caisses.has(caisseKey)) {
                dateGroup.caisses.set(caisseKey, {
                    codecaisse: r.codecaisse,
                    caisse: r.caisse,
                    devise: r.devise_caisse,
                    solde_ouverture: r.solde_ouverture,
                    solde_fermeture: r.solde_fermeture,
                    operations: []
                });
            }

            // Ajout opération
            dateGroup.caisses.get(caisseKey).operations.push({
                typeoperation: r.typeoperation,
                piece: r.operation,
                description: r.libelle_op,
                montant: r.montant,
                deviseop: r.devise_operation,
                montant_ref: r.montant_ref
            });

        });

        // Conversion Map → Array
        const datasql = Array.from(map.values()).map(d => ({
            date: d.date,
            site: d.site,
            codesite: d.codesite,
            caisses: Array.from(d.caisses.values())
        }));

        return { success: true, data: datasql };
    } catch (error) {
        console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        throw error;
    }
}

// Autor : Richard
async function editionjournal(datedebut, datefin, idcaisse, idsite) {
    const pool = await connectDB();

    try {
        const result = await pool.request()
            .input('datedebut', sql.Date, datedebut)
            .input('datefin', sql.Date, datefin)
            .input('idcaisse', sql.UniqueIdentifier, idcaisse)
            .input('idsite', sql.UniqueIdentifier, idsite)
            .query(operationQueries.editionjournal);

        console.log(result.recordset);

        const resultat = result.recordset;

        if (!resultat || resultat.length === 0) {
            return { success: false, message: "Aucune donnée trouvée" };
        }

        const head = resultat[0];
        const map = new Map();

        resultat.forEach(r => {

            const date = r.dateoperation.toISOString().split('T')[0];

            // Niveau DATE
            if (!map.has(date)) {
                map.set(date, {
                    date,
                    solde_ouverture: r.soldeouverture,
                    solde_fermeture: r.soldefermeture,
                    operations: []
                });
            }

            const dateGroup = map.get(date);


            dateGroup.operations.push({
                typeoperation: r.typeoperation,
                dateoperation: r.dateoperation.toISOString().split('T')[0],
                codeoperation: r.codeoperation,
                cnature: r.codenature,
                nature: r.lib_nature,
                ccentre: r.codecentre,
                centre: r.lib_centre,
                ctiers: r.codetiers,
                tiers: r.nom_tiers,
                libelle: r.libelle,
                montant: r.montantligne || 0,
                montant_ope: r.total_ope || 0,
            });
        });

        const lignes = Array.from(map.values());

        const data = {
            codesociete: head.codesociete,
            raisonsociale: head.raisonsociale,
            codesite: head.codesite,
            lib_site: head.lib_site,
            codejournal: head.codejournal,
            lib_journal: head.designation,
            codecaisse: head.codecaisse,
            lib_caisse: head.lib_caisse,
            devise_caisse: head.devise_caisse,
            datedebut: new Date(datedebut).toLocaleDateString('fr-FR'),
            datefin: new Date(datefin).toLocaleDateString('fr-FR'),
            lignes
        };

        return { success: true, data : data };

    } catch (error) {
        console.log(`Erreur de récupération : ${error}`.cyan?.bold || error);
        throw error;
    }
}

function extraireDate(value) {
  return (typeof value === 'string' && value.includes('T'))
    ? value.split('T')[0]
    : null;
}

async function detailOperation(data){
    const pool = await connectDB();

    try {
        const result = await pool.request()
        .input('idsite', sql.UniqueIdentifier, data.idsite)
        .input('typeentitesociete', sql.Int, data.typeentitesociete)
        .input('datedebut', sql.Date, data.datedebut || null)
        .input('datefin', sql.Date, data.datefin || null)
        .input('idcentre', sql.UniqueIdentifier, data.centre || null)
        .input('idnature', sql.UniqueIdentifier, data.nature || null)
        .input('idtiers', sql.UniqueIdentifier, data.tiers || null)
        .input('codeoperation', sql.VarChar(50), data.numero || null)
        .input('montantmin', sql.Decimal(22,9), data.montantmin || null)
        .input('montantmax', sql.Decimal(22,9), data.montantmax || null)
        .query(operationQueries.detailoperation);

        const resultat = result.recordset;

        return resultat;
    } catch (error) {
        console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        throw error;
    }
}

async function getLastOperation(caisses, date, page, limit){
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 6;
    const offset = (page - 1) * limit;

    const pool = await connectDB();

    try {
        const result = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .input('date', sql.Date, date || null)
            .input('caisses', sql.NVarChar, caisses.join(','))
            .query(operationQueries.lastoperation);

        const resultat = result.recordset;
        const total = resultat.length ? resultat[0].total : 0;
        const totalPages = Math.ceil(total / limit);

        const map = new Map();
        resultat.forEach(r => {

            const date = r.date_operation.toISOString().split('T')[0];
            const piece = r.operation;

            // Niveau PIECE
            if (!map.has(piece)) {
                map.set(piece, {
                    piece,
                    date,
                    typeoperation: r.typeoperation,
                    piece: r.operation,
                    montantop: r.montant_op,
                    deviseop : r.devise_operation,
                    caisses: new Map() // important
                });
            }

            const operation = map.get(piece);

           // ================= NIVEAU CAISSE =================
            const keyCaisse = r.codecaisse;

            if (!operation.caisses.has(keyCaisse)) {
                operation.caisses.set(keyCaisse, {
                    codecaisse: r.codecaisse,
                    devise: r.devise_caisse,
                    caisse: r.caisse,
                    montant: r.montant,
                    libelle: r.commentaire,
                    montant_ref: r.montant_ref,
                    solde_ouverture: r.solde_ouverture,
                    solde_fermeture: r.solde_fermeture
                });
            }
        });

        // Conversion Map → Array
        const data = Array.from(map.values()).map(op => ({
            ...op,
            caisses: Array.from(op.caisses.values())
        }));

        return new PaginationModel(page, limit, totalPages, data);
    } catch (error) {
        console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        throw error;
    }
}

async function history(caisses, date, page, limit){
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 6;
    const offset = (page - 1) * limit;

    const pool = await connectDB();

    try {
        const result = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .input('date', sql.Date, date || null)
            .input('caisses', sql.NVarChar, caisses.join(','))
            .query(operationQueries.history);

        const resultat = result.recordset;
        const total = resultat.length ? resultat[0].total : 0;
        const totalPages = Math.ceil(total / limit);

        const map = new Map();
        resultat.forEach(r => {

            const date = r.date_operation.toISOString().split('T')[0];
            const caisseKey = r.operation;

            // Niveau DATE
            if (!map.has(date)) {
                map.set(date, {
                    date,
                    operations: new Map()
                });
            }

            const dateGroup = map.get(date);

            // Niveau CAISSE
            if (!dateGroup.operations.has(caisseKey)) {
                dateGroup.operations.set(caisseKey, {
                    codecaisse: r.codecaisse,
                    caisse: r.caisse,
                    devise: r.devise_caisse,
                    libelle: r.commentaire,
                    montantop: r.montant_op,
                    solde_ouverture: r.solde_ouverture,
                    solde_fermeture: r.solde_fermeture,
                    typeoperation: r.typeoperation,
                    piece: r.operation,
                    montant: r.montant,
                    deviseop: r.devise_operation,
                    montant_ref: r.montant_ref
                });
            }
        });

        // Conversion Map → Array
        const data = Array.from(map.values()).map(d => ({
            date: d.date,
            operations: Array.from(d.operations.values())
        }));

        return new PaginationModel(page, limit, totalPages, data);
    } catch (error) {
        console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        throw error;
    }
}

async function Allpaiement(){
    const pool = await connectDB();

    try {
        const result = await pool.request().query(operationQueries.totalOperation);
        const resultat = result.recordset;
        return { success: true, data: resultat };
    } catch (error) {
        console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        throw error;
    }
}

async function getEtatCloture({ idcaisse, datedebut, datefin }) {
  try {
    const pool = await connectDB();

    const result = await pool.request()
      .input('idcaisse', sql.UniqueIdentifier, idcaisse || null)
      .input('datedebut', sql.DateTime, datedebut || null)
      .input('datefin', sql.DateTime, datefin || null)
      .query(operationQueries.etatcloture);

    const resultat =  result.recordset;

    const data =  resultat.map(item => ({
        idperiode: item.idperiode,
        caisse: {
            id: item.idcaisse,
            libelle: item.caisse_libelle,
            code: item.codecaisse
        },
        date: item.dateperiode,
        devise: item.codedevise,
        codesociete : item.codesociete,
        societe: item.raisonsociale,
        codesite: item.codesite,
        site: item.site_lib,
        soldes: {
            ouverture: Number(item.soldeouverture),
            fermeture: Number(item.soldefermeture),
            physique: Number(item.montantphysique),
            ecart: Number(item.ecart)
        },
        statut: item.statut,
        validation: {
            date: item.validatedat,
            user: item.validatedby
        }
    }));

    return { success: true, data: data };

  } catch (error) {
    console.log(`Erreur de recuperation: ${error}`.cyan.bold);
    throw error;
  }
}

module.exports = {
    journalPaiement,
    editionjournal,
    detailOperation,
    getLastOperation,
    history,
    Allpaiement,
    getEtatCloture
};