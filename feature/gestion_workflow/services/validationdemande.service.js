const validationdemandemodel = require("../models/validationdemande.model");
const { v4: uuidv4 } = require('uuid');

let validationdemande = new validationdemandemodel();
let validationdemandes = [];

async function get_all_validationdemande() {
  const result = await validationdemande.get_allvalidationdemande();
  console.log(result);
  validationdemandes = result.recordset.map(item => new validationdemandemodel(
    item.idvalidationdemande, 
    item.iddemande,
    item.idsociete,
    item.datevalidation,
    item.createdat, 
    item.createdby,
    item.updatedat, 
    item.updatedby));
  return validationdemandes;
}

async function create_validationdemande(data) {
  const today = new Date();

  // Construire correctement le modèle en respectant l’ordre du constructeur
  const newvalidationdemande = new validationdemandemodel(
    uuidv4(),                       // idvalidationdemande
    data.iddemande || null,          // iddemande
    data.idsociete || null,          // idsociete
    data.datevalidation || null,     // datevalidation
    data.createdat || today,         // createdat
    data.createdby || 'System',      // createdby
    data.updatedat || null,          // updatedat
    data.updatedby || null      // updatedby
  );

  const recorded = await newvalidationdemande.create_validationdemandemodel();

  if (!recorded || !recorded.idvalidationdemande) {
    throw new Error("Erreur lors de la création de la demande de validation");
  }

  return {
    success: true,
    message: "Demande validation créée",
    data: recorded
  };
}

async function get_onevalidationdemande(idvalidationdemande) {
  if (!idvalidationdemande) {
    throw new Error("Erreur de donnée");
  }

  try {
    const validationdemande_ = await validationdemande.get_onevalidationdemande(idvalidationdemande);
    return validationdemande_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function update_validationdemande(idvalidationdemande, data) {
  if (!idvalidationdemande) {
    throw new Error("ID manquant");
  }

  // On n’exige plus que iddemande soit présent : il peut être null
  try {
    const updated = await validationdemande.update_validationdemande(idvalidationdemande, {
      iddemande: data.iddemande || null,
      idsociete: data.idsociete || null,
      datevalidation: data.datevalidation || null,
      updatedby: data.updatedby || 'System'
    });

    if (!updated) {
      return { success: false, message: "Aucune modification effectuée" };
    }

    return {
      success: true,
      message: "Demande mise à jour",
      data: updated
    };
  } catch (err) {
    throw err;
  }
}



async function delete_validationdemande(idvalidationdemande) {
   try {
       await validationdemande.delete_validationdemande(idvalidationdemande); // supprime l’entrée
       return { success: true, message: "Demande supprimée" }; // retourne un objet
   } catch (err) {
       throw new Error("Erreur lors de la suppression : " + err.message);
   }
}

module.exports = {
  get_all_validationdemande,
  get_onevalidationdemande,
  create_validationdemande,
  update_validationdemande,
  delete_validationdemande
};
