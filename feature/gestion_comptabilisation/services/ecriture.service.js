
const { DateTime, UniqueIdentifier } = require('mssql');
const {db, sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const alloperationservice = require("../../gestion_comptabilisation/services/alloperations.services");
const rules = require("../../gestion_comptabilisation/rules/index.rule");
const { stat } = require('fs');
const { Console } = require('console');
const queries = require("../query/requete.query");
const piecegenerate = require('../utils/ecritures.utils');
const { type } = require('os');

// Génère une référence unique pour l'écriture
function generateRef(operation) {
    return `${operation.journal}-${Date.now()}`;
}

function getCommonFields(arr) {
    if (!arr.length) return {};

    const common = {};

    const keys = Object.keys(arr[0]);

    for (const key of keys) {
        const value = arr[0][key];

        const isSame = arr.every(obj => obj[key] === value);

        if (isSame) {
            common[key] = value;
        }
    }

    return common;
}


async function GenererEcriture(idoperation) {   
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        

        // Récupération opération et lignes
        const enteteoperation = await alloperationservice.getenteteoperationbyid(idoperation)
        const typeoperation = await alloperationservice.gettypeoperationbyid(idoperation);
        const ligneoperation  = await alloperationservice.getligneoperationbyidoperation(idoperation);
        const paramcomptable = await alloperationservice.getparamcomptable();

        //const justificatifoperation = await alloperationservice.

        if (!enteteoperation.data || !typeoperation.data || !ligneoperation.data.length) throw new Error("Opération ou lignes introuvables");

        // Détection multi-caisse
        const caisses = [...new Set(typeoperation.data.flat().map(t => t.idcaisse))];

        const devises = [...new Set(typeoperation.data.flat().map(t => t.caisse_iddevise))];
        
        let rule;

        if (caisses.length > 1 && devises.length === 1) {
            rule = rules.transfert;
        } else if (caisses.length > 1 && devises.length > 1) {
            rule = rules.conversion;
        } else if (typeoperation.data.flat().map(t => t.codtypeoperation).includes('encaissement')) {
            rule = rules.encaissement;
        } else if (typeoperation.data.flat().map(t => t.codtypeoperation).includes('decaissement') || typeoperation.data.flat().map(t => t.codtypeoperation).includes('decaissementaj')) {
            rule = rules.decaissement;
        } else {
            throw new Error("Règle non définie pour ce type d'opération");
        }

        //Génération des lignes via la règle
        const lignesjournal = rule(enteteoperation.data,typeoperation.data, ligneoperation.data, paramcomptable.data[0]);


        //Groupes les lignes par journaux 
        const groupes = {};

        for (const i of lignesjournal) {
            const journal = i.idjournal;

            if (!groupes[journal]) {
                groupes[journal] = [];
            }

            groupes[journal].push(i);
        }


        //Insertion dans la table ecriture et ligne écriture 
        for (const journalid in groupes) 
     {
            // Création de l'écriture principale
                const lignesJournal = groupes[journalid];
                const idecriture = uuidv4();
                const typeData = lignesJournal.find(l => l.idtypeoperation);

                const headers = getCommonFields(lignesJournal);

                const pieceNumber = await piecegenerate.generatePieceNumber(transaction, headers.journal);

                console.log("typedata",typeData);
                console.log("headers",headers);
                con;
              
                await transaction.request()
                    .input("idecriture", sql.UniqueIdentifier, idecriture)
                    .input("ref_ecriture", sql.NVarChar, pieceNumber)
                    .input("idtypeoperation", sql.NVarChar, typeData.idtypeoperation)
                    .input("codtypeoperation", sql.UniqueIdentifier, typeData.typeoperation)
                    .input("idjournal", sql.UniqueIdentifier, headers.idjournal)
                    .input("journal", sql.NVarChar, headers.journal)
                    .input("date", sql.DateTime, typeData.date)
                    .input("createdby", sql.NVarChar, 'SYSTEM')
                    .query(`
                        INSERT INTO EcritureComptable
                        (idecriture,ref_ecriture, idjournal, idtypeoperation,codtypeoperation, journal, date_operation, createdby, createdat)
                        VALUES (@idecriture, @ref_ecriture, @idjournal, @idtypeoperation, @codtypeoperation, @journal, @date, @createdby, GETDATE())
                    `);

            // Insertion des lignes comptables
            let totalDebit = 0, totalCredit = 0;
            let num = 1;

            for (const l of lignesjournal) {
                totalDebit += l.debit || 0;
                totalCredit += l.credit || 0;
         
              
                const compteExists = await transaction.request()
                .input("idcompte", sql.UniqueIdentifier, l.idcompte)
                .query(`SELECT 1 FROM PlanComptable WHERE idcompte = @idcompte`);


            if (compteExists.recordset.length === 0) {
                throw new Error(`Le compte ${l.idcompte} n'existe pas dans PlanComptable (ligne ${num})`);
            }
             
                await transaction.request()
                    .input("idligneecriture", sql.UniqueIdentifier, uuidv4())
                    .input("idecriture", sql.UniqueIdentifier,idecriture)
                    .input("numligne", sql.Int, l.numligne || num++)
                    .input("idcompte", sql.UniqueIdentifier, l.idcompte)
                    .input("compte", sql.NVarChar, l.compte)
                    .input("idnature", sql.UniqueIdentifier, l.idnature || null)
                    .input("nature", sql.NVarChar, l.libellenature || null)
                    .input("idcentreanalytique", sql.UniqueIdentifier, l.idcentreanalytique || null)
                    .input("centreanalytique", sql.NVarChar, l.centreanalytique || null)
                    .input("idtiers", sql.UniqueIdentifier, l.idtiers || null)
                    .input("tiers", sql.NVarChar, l.tiers || null)
                    .input("debit", sql.Decimal(22,9), l.debit || 0)
                    .input("credit", sql.Decimal(22,9), l.credit || 0)
                    .input("etat", sql.NVarChar, l.etat || 'validee')
                    .input("iddevise", sql.UniqueIdentifier, l.iddevise)
                    .input("devise", sql.NVarChar, l.devise)
                    .input("montantdevise", sql.Decimal(22,9), l.montantdevise)
                    .input("taux", sql.Decimal(18,6), l.taux || 1)
                    .input("montantbase", sql.Decimal(22,9),l.montantref )
                    .input("typeecriture", sql.NVarChar, l.typeecriture || 'normale')
                    .query(queries.createligneecriture);

                await transaction.request()
                .input("idligneoperation", sql.UniqueIdentifier, l.idligneoperation)
                .input("numpiececomptable", sql.NVarChar,pieceNumber)
                .query(`
                UPDATE ligneoperationCaisse
                SET comptabilise = 1,numpiececomptable=@numpiececomptable,datecomptabilisation = GETDATE()
                WHERE idligneoperation = @idligneoperation
                `);


            }

            console.log(`Journal ${lignesJournal[0].journal} : Total Débit = ${totalDebit}, Total Crédit = ${totalCredit}`);
            // Contrôle équilibre comptable
             if (totalDebit !== totalCredit) {
            throw new Error(`Écriture déséquilibrée : D=${totalDebit} C=${totalCredit}`);
            }

            
    }

       
        //Commit transaction
        await transaction.commit();

        return { success: true  , message: "Écriture générée avec succès" };

    } catch (error) {
        await transaction.rollback();
        return { success: false, message: error.message };
    }
}

async function GenererJustificatif(idjustificatif) {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    let result = [];

    try {
         const justificatif = await alloperationservice.getjustificatifbyid(idjustificatif);
         const justificatifdetails = await alloperationservice.getjustificatifdetailsbyid(idjustificatif);
         const typeoperation = await alloperationservice.gettypeoperationbyid(justificatif.data[0].idoperation);
         const paramcomptable = await alloperationservice.getparamcomptable();
         const Natureoperationdecaj = await alloperationservice.getnatureoperationdecaj();


         if (!justificatif.data) throw new Error("Justificatif introuvable");
         const base = typeoperation.data.flat().find(m => m.taux === 1);
         if (!base) throw new Error("Aucune caisse de référence (taux=1)");

         const ecriturecomptable = await alloperationservice.getecriturecomptablebyid(base.idtypeoperation);

         const result = rules.justificatif(paramcomptable.data[0],Natureoperationdecaj.data[0],justificatif,justificatifdetails,typeoperation.data[0],ecriturecomptable.data[0]);

         const idecriture = uuidv4();

        await transaction.request()
                    .input("idecriture", sql.UniqueIdentifier, idecriture)
                    .input("ref_ecriture", sql.NVarChar, ecriturecomptable.data[0][0].ref_ecriture) // à revoir
                    .input("idtypeoperation", sql.NVarChar, ecriturecomptable.data[0][0].idtypeoperation)
                    .input("codtypeoperation", sql.UniqueIdentifier, ecriturecomptable.data[0][0].typeoperation)
                    .input("idjournal", sql.UniqueIdentifier, ecriturecomptable.data[0][0].idjournal)
                    .input("journal", sql.NVarChar, ecriturecomptable.data[0][0].journal)
                    .input("date", sql.DateTime, ecriturecomptable.data[0][0].date)
                    .input("createdby", sql.NVarChar, 'SYSTEM')
                    .query(`
                        INSERT INTO EcritureComptable
                        (idecriture,ref_ecriture, idjournal, idtypeoperation,codtypeoperation, journal, date_operation, createdby, createdat)
                        VALUES (@idecriture, @ref_ecriture, @idjournal, @idtypeoperation, @codtypeoperation, @journal, @date, @createdby, GETDATE())
                    `);
         
         let totalDebit = 0, totalCredit = 0;
         let num = 1;
    for (const r of result) {
        //insertion des écritures
        totalDebit += r.debit || 0;
        totalCredit += r.credit || 0;

        await transaction.request()
                    .input("idligneecriture", sql.UniqueIdentifier, uuidv4())
                    .input("idecriture", sql.UniqueIdentifier, idecriture)
                    .input("numligne", sql.Int,num++) 
                    .input("idcompte", sql.UniqueIdentifier, r.idcompte)
                    .input("compte", sql.NVarChar, r.compte)
                    .input("idnature", sql.UniqueIdentifier, r.idnature || null)
                    .input("nature", sql.NVarChar, r.libellenature || null)
                    .input("idcentreanalytique", sql.UniqueIdentifier, r.idcentreanalytique || null)
                    .input("centreanalytique", sql.NVarChar, r.centreanalytique || null)
                    .input("idtiers", sql.UniqueIdentifier, r.idtiers || null)
                    .input("tiers", sql.NVarChar, r.tiers || null)
                    .input("debit", sql.Decimal(22,9), r.debit || 0)
                    .input("credit", sql.Decimal(22,9), r.credit || 0)
                    .input("etat", sql.NVarChar, r.etat || 'validee')
                    .input("iddevise", sql.UniqueIdentifier, r.iddevise)
                    .input("devise", sql.NVarChar, r.devise)
                    .input("montantdevise", sql.Decimal(22,9), r.montantdevise)
                    .input("taux", sql.Decimal(18,6), r.taux || 1)
                    .input("montantbase", sql.Decimal(22,9),r.montantref )
                    .input("typeecriture", sql.NVarChar, r.typeecriture || 'normale')
                    .query(queries.createligneecriture);
                 
                await transaction.request()
                .input("iddetailsjustificatifoperation", sql.UniqueIdentifier, justificatifdetails.data[0][0].iddetailsjustificatifoperation)
                .input("numpiececomptable", sql.NVarChar,ecriturecomptable.data[0][0].ref_ecriture)
                .query(`
                UPDATE DetailsJustificatifOperation
                SET comptabilise =1,numpiececomptable=@numpiececomptable,datecomptabilisation = GETDATE()
                WHERE iddetailsjustificatifoperation= @iddetailsjustificatifoperation
                `);

    }
    if (totalDebit !== totalCredit) {
         throw new Error(`Écriture déséquilibrée : D=${totalDebit} C=${totalCredit}`);
    }

     await transaction.commit();

    return { success: true  , message: "Justificatif généré avec succès" };

    } catch (error) {
        await transaction.rollback();
        return { success: false, message: error.message };
    }
}

module.exports = {
    GenererJustificatif,
    GenererEcriture };




