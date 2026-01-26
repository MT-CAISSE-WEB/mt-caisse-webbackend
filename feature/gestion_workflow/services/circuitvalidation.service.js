const circuitvalidationmodel = require("../models/circuitvalidation.model");
const { v4: uuidv4 } = require('uuid');

let circuitvalidation = new circuitvalidationmodel();
let circuitvalidations = [];

async function get_all_circuitvalidation() {
  const result = await circuitvalidation.get_allcircuitvalidation(); // modifie la requête ici
  
  // résultat plat (chaque ligne = circuit + étape + validateur)
  const rows = result.recordset;

  // Map pour regrouper circuits
  const circuitsMap = new Map();

  for (const row of rows) {
    // Ajout ou récupération du circuit
    if (!circuitsMap.has(row.idcircuitvalidation)) {
      circuitsMap.set(row.idcircuitvalidation, {
        idcircuitvalidation: row.idcircuitvalidation,
        codecircuitvalidation: row.codecircuitvalidation,
        typeentite: row.typeentite,
        typeaction: row.typeaction,
        idsociete: row.idsociete,
        idsite: row.idsite,
        actif: row.actif,
        createdat: row.createdat,
        createdby: row.createdby,
        updatedat: row.updatedat,
        updatedby: row.updatedby,
        societe: row.societe,
        site: row.site,
        etapes: []
      });
    }

    const circuit = circuitsMap.get(row.idcircuitvalidation);

    // Gestion des étapes (Map temporaire pour éviter doublons)
    if (!circuit._etapesMap) circuit._etapesMap = new Map();

    if (!circuit._etapesMap.has(row.idcircuitetape)) {
      circuit._etapesMap.set(row.idcircuitetape, {
        idcircuitetape: row.idcircuitetape,
        rang: row.rang,
        nombrevalidateur: row.nombrevalidateur,
        validateurs: []
      });
      circuit.etapes.push(circuit._etapesMap.get(row.idcircuitetape));
    }

    const etape = circuit._etapesMap.get(row.idcircuitetape);

    // Ajouter validateur s'il existe
    if (row.idutilisateur) {
      etape.validateurs.push({
        idutilisateur: row.idutilisateur,
        prenom: row.prenom,
        nom: row.nom
      });
    }
  }

  // Nettoyer les maps temporaires
  for (const circuit of circuitsMap.values()) {
    delete circuit._etapesMap;
  }

  // Retourner tableau de circuits avec étapes + validateurs imbriqués
  return Array.from(circuitsMap.values());
}



async function create_circuitvalidation(data) {

  const today = new Date();

  const newcircuitvalidation = new circuitvalidationmodel(
    uuidv4(),
    data.codecircuitvalidation,
    data.typeentite,
    data.typeaction,
    data.idsociete,
    data.idsite,
    data.createdat || today,
    data.createdby || 'System',
    data.updatedat || today,
    data.updatedby || null
  );

  const recorded = await newcircuitvalidation.create_circuitvalidationmodel();

  if (!recorded.success) throw new Error(recorded.message);

  return recorded;
}


async function get_onecircuitvalidation(idcircuitvalidation) {
  if (!idcircuitvalidation) {
    throw new Error("Erreur de donnée");
  }

  try {
    const circuitvalidation_ = await circuitvalidation.get_onecircuitvalidation(idcircuitvalidation);
    return circuitvalidation_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function update_circuitvalidation(idcircuitvalidation, data) {
  if (!idcircuitvalidation || !data.codecircuitvalidation) {
    throw new Error("Erreur de donnée");
  }
  
 
  try {
    const circuitvalidation_ = await circuitvalidation.update_circuitvalidation(idcircuitvalidation, data);
    return circuitvalidation_;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function delete_circuitvalidation(idcircuitvalidation) {
   try {
    const circuitvalidation_ = await circuitvalidation.delete_circuitvalidation(idcircuitvalidation);
    if (!circuitvalidation_.success) {
      throw new Error(circuitvalidation_.message);
    }
    return circuitvalidation_;
   } catch (err) {
    throw err;
   }
}


module.exports = {
  get_all_circuitvalidation,
  get_onecircuitvalidation,
  create_circuitvalidation,
  update_circuitvalidation,
  delete_circuitvalidation
};
