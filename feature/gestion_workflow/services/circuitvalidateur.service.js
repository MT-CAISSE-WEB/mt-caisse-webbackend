const circuitvalidateurmodel = require("../models/circuitvalidateur.model");
const { v4: uuidv4 } = require('uuid');

let circuitvalidateur = new circuitvalidateurmodel();
let circuitvalidateurs = [];

async function get_all_circuitvalidateur() {
  const result = await circuitvalidateur.get_allcircuitvalidateur();
  circuitvalidateurs = result.recordset.map(item => new circuitvalidateurmodel(
    item.idcircuitvalidateur,
    item.codecircuitvalidateur, 
    item.idutilisateur,
    item.idsociete,
    item.idcircuitvalidation,
    item.rangvalidation,  
    item.createdat, 
    item.createdby,
    item.updatedat, 
    item.updatedby));
  return circuitvalidateurs;
}

async function create_circuitvalidateur(data) {
  if (!data.codecircuitvalidateur) {
    throw new Error("Le champ codecircuitvalidateur est requis.");
  }

  const today = new Date();

  // Construire correctement le modèle en respectant l’ordre du constructeur
  const newcircuitvalidateur = new circuitvalidateurmodel(
    uuidv4(),                       // idcircuitvalidateur
    data.codecircuitvalidateur,      // codecircuitvalidateur
    data.idutilisateur || null,      // idutilisateur
    data.idsociete || null,          // idsociete
    data.idcircuitvalidation || null,// idcircuitvalidation
    data.rangvalidation || 0,        // rangvalidation
    data.createdat || today,         // createdat
    data.createdby || 'System',      // createdby
    data.updatedat || null,          // updatedat
    data.updatedby || null      // updatedby
  );

  // Appel correct de la méthode qui fait l'INSERT
  const recorded = await newcircuitvalidateur.create_circuitvalidateurmodel();

  // Gestion de l’erreur si l’INSERT échoue
  if (!recorded || !recorded.idcircuitvalidateur) {
    throw new Error("Erreur lors de la création du circuit validateur");
  }

  return {
    success: true,
    message: "Circuit validateur créé",
    data: recorded
  };
}

async function get_onecircuitvalidateur(idcircuitvalidateur) {
  if (!idcircuitvalidateur) {
    throw new Error("Erreur de donnée");
  }

  try {
    const circuitvalidateur_ = await circuitvalidateur.get_onecircuitvalidateur(idcircuitvalidateur);
    return circuitvalidateur_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function update_circuitvalidateur(idcircuitvalidateur, data) {
  if (!idcircuitvalidateur) {
    throw new Error("L'ID est requis");
  }

  try {
    // 1️⃣ Charger l’ancien record
    const old = await circuitvalidateur.get_onecircuitvalidateur(idcircuitvalidateur);
    if (!old) throw new Error("Circuit validateur introuvable");

    // 2️⃣ Injecter les nouvelles valeurs dans l’instance du model
    circuitvalidateur.idcircuitvalidateur = idcircuitvalidateur;
    circuitvalidateur.codecircuitvalidateur = data.codecircuitvalidateur ?? old.codecircuitvalidateur;
    circuitvalidateur.idutilisateur = data.idutilisateur ?? old.idutilisateur;
    circuitvalidateur.idsociete = data.idsociete ?? old.idsociete;
    circuitvalidateur.idcircuitvalidation = data.idcircuitvalidation ?? old.idcircuitvalidation;
    circuitvalidateur.rangvalidation = data.rangvalidation ?? old.rangvalidation;

    // timestamps
    circuitvalidateur.updatedat = new Date();
    circuitvalidateur.updatedby = data.updatedby || "System";

    // 3️⃣ Exécuter la requête SQL
    const updated = await circuitvalidateur.update_circuitvalidateur(idcircuitvalidateur);

    // 4️⃣ Retourner proprement
    return updated;

  } catch (err) {
    console.error("Erreur update:", err);
    throw err;
  }
}


async function delete_circuitvalidateur(idcircuitvalidateur) {
   try {
       await circuitvalidateur.delete_circuitvalidateur(idcircuitvalidateur); // supprime l’entrée
       return { success: true, message: "Circuit validateur supprimé" }; // retourne un objet
   } catch (err) {
       throw new Error("Erreur lors de la suppression : " + err.message);
   }
}

module.exports = {
  get_all_circuitvalidateur,
  get_onecircuitvalidateur,
  create_circuitvalidateur,
  update_circuitvalidateur,
  delete_circuitvalidateur
};
