const natureoperationmodel = require("../models/natureoperation.model");
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { parse } = require("csv-parse");

const plancomptablemodel = require("../models/plancomptable.model");

let nature = new natureoperationmodel();

let natures = []; 



async function get_all_natures() {
    const result = await nature.get_allnatures();
    natures = result.data.map(item => new natureoperationmodel(
    item.idnature,
    item.codenature,
    item.libelle,
    item.typeoperation,
    item.decajustifier,
    item.imputationtiers,
    item.actif,
    item.demandedecaissement,
    item.idsociete,
    item.idcompte,
    item.createdat,
    item.updatedat, 
    item.createdby, 
    item.updatedby,
    item.idcompte ? new plancomptablemodel(
      item.compte_idcompte, item.compte_numcompte, item.compte_libelle, item.compte_ventillable, 
      item.compte_auxiliaire, item.compte_actif, item.compte_suivibudgetaire, 
      item.compte_suivibudgetairemensuel) : null,
  ));

  return natures;

}


// OK
async function create_nature(data) {
  // if (!data.codenature || !data.libelle || !data.typeoperation || !data.libelle || !data.idsociete || !data.idcompte) {
  //   return new Error("Tous les champs sont requis.");
  // }

  const today = new Date();
  const newnature = new natureoperationmodel(
    uuidv4(), 
    data.codenature, 
    data.libelle,
    data.typeoperation,
    data.decajustifier, 
    data.imputationtiers, 
    data.actif, 
    data.demandedecaissement,
    data.idsociete,
    data.idcompte,
    data.createdat || today, 
    data.updatedat || null, 
    data.createdby || 'System',
    data.updatedby || null);

  const recorded = await newnature.create_nature(newnature);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }
  return recorded.data;
}


// OK
async function get_by_idnature(idnature) {
  if (!idnature) {
    throw new Error("Ce compte n'existe pas.");
  }

  try {
    const nature_ = await nature.get_onenature(idnature);
    return nature_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}


async function update_nature(idnature, data) {
  if (!idnature) {
    throw new Error("Erreur de donnée");
  }

  try {
    const nature_ = await nature.update_nature(idnature, data);
    return nature_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
}

// OK
async function delete_nature(idnature) {
   try {
    const nature_ = await nature.delete_nature(idnature);
    if (!nature_.success) {
      throw new Error(nature_.message);
    }
    return nature_;
   } catch (err) {
    console.log(`Aucune donnée: ${err.message}`.cyan.bold);
    throw err;
   }
}


async function import_nature(filePath, info) {
  const today = new Date();
  const parser = fs
    .createReadStream(filePath)
    .pipe(parse({ delimiter: ";", from_line: 1 }));

    try {
      for await (const row of parser) {
        // recupere les donnees
        try{          
          const data = {
            codenature: row[0]?.trim(),
            libelle: row[1]?.trim(),
            decajustifier: Number(row[2]),
            imputationtiers: Number(row[3]),
            demandedecaissement: Number(row[4]),
            typeoperation: Number(row[5]),
            actif: Number(row[6]),
            idsociete: info.idsociete,
            idcompte: info.idcompte,
            createdby: info.createdby,
            createdat: today
          };

        await create_nature(data);
      
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
  get_all_natures,
  get_by_idnature,
  create_nature,
  update_nature,
  delete_nature,
  import_nature
};
