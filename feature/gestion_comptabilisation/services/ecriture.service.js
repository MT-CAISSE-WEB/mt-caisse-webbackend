
const { DateTime, UniqueIdentifier } = require('mssql');
const {db, sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const alloperationservice = require("../../gestion_comptabilisation/services/alloperations.services");
const rules = require("../../gestion_comptabilisation/rules/index.rule");
const { stat } = require('fs');
const { Console } = require('console');
const queries = require("../query/requete.query");

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

        if (!enteteoperation.data || !typeoperation.data || !ligneoperation.data.length) throw new Error("Opération ou lignes introuvables");

        // Détection multi-caisse
        const caisses = [...new Set(typeoperation.data.flat().map(t => t.idcaisse))];

        const devises = [...new Set(typeoperation.data.flat().map(t => t.caisse_iddevise))];

        console.log("Caisses impliquées :", caisses);
        console.log("Devises impliquées :", devises);
        
        let rule;

        if (caisses.length > 1 && devises.length === 1) {
            rule = rules.transfert;
        } else if (caisses.length > 1 && devises.length > 1) {
            rule = rules.conversion;
        } else if (typeoperation.data.flat().map(t => t.codtypeoperation).includes('encaissement')) {
            rule = rules.encaissement;
        } else if (typeoperation.data.flat().map(t => t.codtypeoperation).includes('decaissement')) {
            rule = rules.decaissement;
        } else if (typeoperation.data.flat().map(t => t.codtypeoperation).includes('decaissementaj')) {
            rule = rules.decaissementaj;
        } else {
            throw new Error("Règle non définie pour ce type d'opération");
        }

        //Génération des lignes via la règle
        const lignesjournal = rule(enteteoperation.data,typeoperation.data, ligneoperation.data);

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
                
                await transaction.request()
                    .input("idecriture", sql.UniqueIdentifier, idecriture)
                    .input("idjournal", sql.UniqueIdentifier, headers.idjournal)
                    .input("typeoperation", sql.NVarChar, typeData.codtypeoperation)
                    .input("idtypeoperation", sql.UniqueIdentifier, typeData.idtypeoperation)
                    .input("journal", sql.NVarChar, headers.journal)
                    .input("date", sql.DateTime, new Date())
                    .input("createdby", sql.NVarChar, 'SYSTEM')
                    .query(`
                        INSERT INTO EcritureComptable
                        (idecriture, idjournal, idtypeoperation,typeoperation, journal, date_operation, createdby, createdat)
                        VALUES (@idecriture, @idjournal, @idtypeoperation, @typeoperation, @journal, @date, @createdby, GETDATE())
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
                .query(`
                UPDATE ligneoperationCaisse
                SET comptabilise = 1
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

module.exports = { GenererEcriture };




