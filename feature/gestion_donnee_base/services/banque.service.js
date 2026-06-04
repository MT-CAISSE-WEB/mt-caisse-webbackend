const banquemodel = require("../models/banque.model");
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { parse } = require("csv-parse");

const plancomptablemodel = require("../models/plancomptable.model");
const devisemodel = require("../../gestion_organisation/models/devise.model");

let banque = new banquemodel();

let banques = []; 


// OK
async function get_all_banques() {
    const result = await banque.get_allbanques();
    banques = result.data.map(item => new banquemodel(
    item.idbanque,
    item.codebanque,
    item.libelle,
    item.numerocompte,
    item.iban,
    item.swift,
    item.actif,
    item.solde_initial,
    item.solde_actuel,
    item.idsociete,
    item.idsite,
    item.idcompte,
    item.iddevise,
    item.createdat,
    item.updatedat, 
    item.createdby, 
    item.updatedby,
    item.idcompte ? new plancomptablemodel(
      item.compte_idcompte, item.compte_numcompte, item.compte_libelle) : null,
    item.iddevise ? new devisemodel(
      item.devise_iddevise, item.devise_codedevise, item.devise_intitule) : null
  ));

  return banques;

}


// OK
async function create_banque(data) {

  const today = new Date();
  const newbanque = new banquemodel(
    uuidv4(), 
    data.codebanque, 
    data.libelle,
    data.numerocompte,
    data.iban, 
    data.swift, 
    data.actif, 
    data.solde_initial,
    data.solde_actuel,
    data.idsociete,
    data.idsite || null,
    data.idcompte,
    data.iddevise,
    data.createdat || today, 
    data.updatedat || null, 
    data.createdby || 'System',
    data.updatedby || null);

  const recorded = await newbanque.create_banque(newbanque);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }
  return recorded.data;
}


// OK
async function get_by_idbanque(idbanque) {
  if (!idbanque) {
    throw new Error("Cette banque n'existe pas.");
  }

  try {
    const banque_ = await banque.get_onebanque(idbanque);
    return banque_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


// OK
async function update_banque(idbanque, data) {
  if (!idbanque) {
    throw new Error("Erreur de donnée");
  }

  try {
    const banque_ = await banque.update_banque(idbanque, data);
    return banque_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
}

// OK
async function delete_banque(idbanque) {
   try {
    const banque_ = await banque.delete_banque(idbanque);
    if (!banque_.success) {
      throw new Error(banque_.message);
    }
    return banque_;
   } catch (err) {
    console.log(`Aucune donnée: ${err.message}`.cyan.bold);
    throw err;
   }
}

// OK
async function import_banque(filePath, info) {
  const today = new Date();
  const parser = fs
    .createReadStream(filePath)
    .pipe(parse({ delimiter: ";", from_line: 1 }));

    try {
      for await (const row of parser) {
        // recupere les donnees
        try{          
          const data = {
            codebanque: row[0]?.trim(),
            libelle: row[1]?.trim(),
            iban: Number(row[2]),
            swift: Number(row[3]),
            solde_initial: Number(row[4]),
            numerocompte: Number(row[5]),
            actif: Number(row[6]),
            idsociete: info.idsociete,
            createdby: info.createdby,
            updatedby: info.createdby,
            createdat: today,
            updatedat: today
          };

        await create_banque(data);
      
        } catch (error) {
        console.error("Error:", error.message);
        throw error; }
      }
    }  catch (error) {
        console.error("Error:", error.message);
        throw error;
    }
}

// OK
async function exportbanques(debut, fin) {
  try {
    const data = await banque.exportBanques(debut, fin);

    return data;
    
  } catch (err) {
    console.log(`Aucune donnée: ${err.message}`);
    throw err;
  }
}


module.exports = {
  get_all_banques,
  get_by_idbanque,
  create_banque,
  update_banque,
  delete_banque,
  import_banque,
  exportbanques
};
