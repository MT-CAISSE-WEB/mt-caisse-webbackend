const tiersmodel = require("../models/tiers.model");
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { parse } = require('csv-parse');

const societemodel = require("../../gestion_organisation/models/societe.model");

let tier = new tiersmodel();

let tiers = [];

// OK
async function get_all_tiers() {
  const result = await tier.get_alltiers();
  tiers = result.data.map(item => new tiersmodel(
    item.idtiers,
    item.codetiers, 
    item.designation,
    item.typetiers, 
    item.actif, 
    item.idsociete,
    item.createdat, 
    item.updatedat, 
    item.createdby, 
    item.updatedby,
    item.idsociete ? new societemodel(
        item.societe_idsociete, item.societe_codesociete, item.societe_raisonsociale, 
        item.societe_email, item.societe_telephone, item.societe_adresse, 
        item.societe_createdat, item.societe_updatedat) : null,
  ));

  return tiers;
}


// OK
async function create_tiers(data) {
  // if (!data.codetiers || !data.designation || !data.typetiers || !data.actif || !data.idsociete) {
  //   console.log(data);
  //   throw new Error("Tous les champs sont requis.");
  // }

  const today = new Date();

  const newtiers = new tiersmodel(
    uuidv4(), 
    data.codetiers, 
    data.designation,
    data.typetiers, 
    data.actif, 
    data.idsociete,
    data.createdat || today, 
    data.updatedat || null, 
    data.createdby || 'System',
    data.updatedby || null);

  const recorded = await newtiers.create_tiers(newtiers);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }
  return recorded.data;
}


// OK
async function get_by_idtiers(idtiers) {
  if (!idtiers) {
    throw new Error("Ce tiers n'existe pas.");
  }

  try {
    const tiers_ = await tier.get_onetiers(idtiers);
    return tiers_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


async function update_tiers(idtiers, data) {
  if (!idtiers) {
    throw new Error("Erreur de donnée");
  }

  try {
    const tiers_ = await tier.update_tiers(idtiers, data);
    return tiers_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
}


// OK
async function delete_tiers(idtiers) {
   try {
    const tiers_ = await tier.delete_tiers(idtiers);
    if (!tiers_.success) {
      throw new Error(tiers_.message);
    }
   } catch (err) {
    console.log(`Aucune donnée: ${err.message}`.cyan.bold);
    throw err;
   }
}


async function import_tiers(filePath, info) {
  const today = new Date();
  const parser = fs
    .createReadStream(filePath)
    .pipe(parse({ delimiter: ";", from_line: 1 }));

    try {
      for await (const row of parser) {
        // recupere les donnees
        try{          
          const data = {
            codetiers: row[0]?.trim(),
            designation: row[1]?.trim(),
            typetiers: row[2]?.trim(),
            actif: Number(row[3]),
            idsociete: info.idsociete,
            createdby: info.createdby,
            createdat: today
          };

        await create_tiers(data);
      
        } catch (error) {
        console.error("Error:", error.message);
        throw error; }
      }
    }  catch (error) {
        console.error("Error:", error.message);
        throw error;
    }
}



module.exports = {
  get_all_tiers,
  get_by_idtiers,
  create_tiers,
  update_tiers,
  delete_tiers,
  import_tiers
};
