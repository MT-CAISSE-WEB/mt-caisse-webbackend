const affectationnaturecentremodel = require("../models/affectationnaturecentre.model");
const { v4: uuidv4 } = require('uuid');
const sql = require("mssql");
const fs = require('fs');
const { parse } = require("csv-parse");
const {connectDB} = require('../../../config/db');


let affectation = new affectationnaturecentremodel();

async function getAllCentres(idnature) {
  if (!idnature) {
    throw new Error("Cette nature n'existe pas.");
  }

  try {
    const affectation_ = await affectation.getallCentres(idnature);
    return affectation_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


async function saveAffectations(idnature, idsCentres, info) {

  try {
    const affectation_ = await affectation.saveAffectations(idnature, idsCentres, info);
    return affectation_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


async function exportAffCentres(debut, fin) {
  try {
    const data = await affectation.exportAffCentres(debut, fin);

    return data;
  } catch (err) {
    console.log(`Aucune donnée: ${err.message}`);
    throw err;
  }
}


// Requête d'insertion (IMPORT) OK
const query = `INSERT INTO AffectationNatureCentre (idaffnaturecentre, idnature, 
        idcentreanalytique, idsociete,
        createdat, createdby, updatedat, updatedby) 
    OUTPUT INSERTED.*
    VALUES ( @idaffnaturecentre,
    @idnature, @idcentreanalytique, @idsociete,
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
  const [natures, centres] = await Promise.all([
    pool.request().query(`SELECT idnature, codenature FROM NatureOperation`),
    pool.request().query(`SELECT idcentreanalytique, codecentreanalytique FROM CentreAnalytique`)
  ]);

  const naturesMap = new Map();
  natures.recordset.forEach(n =>
    naturesMap.set(n.codenature.trim(), n.idnature)
  );

  const centresMap = new Map();
  centres.recordset.forEach(c =>
    centresMap.set(c.codecentreanalytique.trim(), c.idcentreanalytique)
  );

  // 2. Stockage temporaire
  const dataToInsert = [];
  const erreurs = [];

  // 3. Lecture fichier
  for await (const row of parser) {

    const codenature = row[0]?.trim();
    const codecentre = row[1]?.trim();

    const idnature = naturesMap.get(codenature);
    const idcentre = centresMap.get(codecentre);


    if (!idnature || !idcentre) {
      erreurs.push(`Introuvable : ${codenature} / ${codecentre}`);
      continue;
    }

    dataToInsert.push({
      idaffnaturecentre: uuidv4(),
      idnature,
      idcentreanalytique: idcentre,
      idsociete: info.idsociete,
      createdby: info.createdby,
      updatedby: info.createdby,
      createdat: today,
      updatedat: today
    });
  }

  const data = dataToInsert;

  // Si rien à insérer
  if (data.length === 0) {
    return { success: false, message: "Aucune donnée valide", erreurs };
  }


  // Enregistrement dans la base
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    for (const item of data) {
      await transaction.request()
        .input('idaffnaturecentre', sql.UniqueIdentifier, item.idaffnaturecentre)
        .input('idnature', sql.UniqueIdentifier, item.idnature)
        .input('idcentreanalytique', sql.UniqueIdentifier, item.idcentreanalytique)
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
  getAllCentres,
  saveAffectations,
  import_affectations,
  exportAffCentres
};
