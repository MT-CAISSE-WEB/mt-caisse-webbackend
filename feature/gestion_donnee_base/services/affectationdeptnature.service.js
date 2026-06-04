const affectationdepartementnaturemodel = require("../models/affectationdeptnature.model");
const { v4: uuidv4 } = require('uuid');
const sql = require("mssql");
const fs = require('fs');
const { parse } = require("csv-parse");
const {connectDB} = require('../../../config/db');

let affectation = new affectationdepartementnaturemodel();

async function getAllNatures(iddepartement) {
  if (!iddepartement) {
    throw new Error("Ce département n'existe pas.");
  }

  try {
    const affectation_ = await affectation.getallNatures(iddepartement);
    return affectation_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


async function saveAffectations(iddepartement, idsNatures, info) {

  try {
    const affectation_ = await affectation.saveAffectations(iddepartement, idsNatures, info);
    return affectation_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


async function exportAffDepartements(debut, fin) {
  try {
    const data = await affectation.exportAffDepartements(debut, fin);

    return data;
    
  } catch (err) {
    console.log(`Aucune donnée: ${err.message}`);
    throw err;
  }
}


// Requête d'insertion (IMPORT) OK
const query = `INSERT INTO AffectationDepartementNature (idaffdepartementnature, iddepartement
    , idnature, idsociete, createdat, createdby, updatedat, updatedby) 
    OUTPUT INSERTED.*
    VALUES ( @idaffdepartementnature, @iddepartement, @idnature, @idsociete,
    @createdat, @createdby, @updatedat, @updatedby)`;


// OK
async function import_affectations(filePath, info) {

  // Lecture du fichier et préparation des données
  const pool = await connectDB();

  const today = new Date();

  const parser = fs
    .createReadStream(filePath)
    .pipe(parse({ delimiter: ";", from_line: 1 }));


  // Charger référentiels UNE SEULE FOIS
  const [departements, natures] = await Promise.all([
    pool.request().query(`SELECT iddepartement, codedept FROM Departement`),
    pool.request().query(`SELECT idnature, codenature FROM NatureOperation`),
  ]);

  const departementsMap = new Map();
  departements.recordset.forEach(d =>
    departementsMap.set(d.codedept.trim(), d.iddepartement)
  );

  const naturesMap = new Map();
  natures.recordset.forEach(n =>
    naturesMap.set(n.codenature.trim(), n.idnature)
  );

  // 2. Stockage temporaire
  const dataToInsert = [];
  const erreurs = [];

  // 3. Lecture fichier
  for await (const row of parser) {

    const codedept = row[0]?.trim();
    const codenature = row[1]?.trim();

    const iddepartement = departementsMap.get(codedept);
    const idnature = naturesMap.get(codenature);


    if (!iddepartement || !idnature) {
      erreurs.push(`Introuvable : ${codedept} / ${codenature}`);
      continue;
    }

    dataToInsert.push({
      idaffdepartementnature: uuidv4(),
      iddepartement,
      idnature,
      idsociete: info.idsociete,
      createdby: info.createdby,
      updatedby: info.createdby,
      createdat: today,
      updatedat: today
    });
  }

  // Si rien à insérer
  if (dataToInsert.length === 0) {
    return { success: false, message: "Aucune donnée valide", erreurs };
  }

  // Enregistrement dans la base
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    for (const item of dataToInsert) {
      await transaction.request()
        .input('idaffdepartementnature', sql.UniqueIdentifier, item.idaffdepartementnature)
        .input('iddepartement', sql.UniqueIdentifier, item.iddepartement)
        .input('idnature', sql.UniqueIdentifier, item.idnature)
        .input('idsociete', sql.UniqueIdentifier, item.idsociete)
        .input('createdby', sql.NVarChar(50), item.createdby)
        .input('updatedby', sql.NVarChar(50), item.updatedby)
        .input('createdat', sql.DateTime, item.createdat)
        .input('updatedat', sql.DateTime, item.updatedat)
        .query(query);
    }

    await transaction.commit();

  } catch (err) {
    console.log("Erreur transaction:", err);
    await transaction.rollback();
    throw err;
  }
}




module.exports = {
  getAllNatures,
  saveAffectations,
  exportAffDepartements,
  import_affectations
};
