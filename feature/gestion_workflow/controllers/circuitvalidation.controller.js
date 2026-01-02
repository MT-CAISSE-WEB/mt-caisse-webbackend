const circuitvalidationservice = require("../services/circuitvalidation.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");
const db = require('../../../config/db');

/**
 * Liste tous les Worflow
 */
module.exports.get_circuitvalidations = asyncHandler(async(req, res, next) => {
  try {
    const circuitvalidations = await circuitvalidationservice.get_all_circuitvalidation();
    res.json({ success: true, data: circuitvalidations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 */
module.exports.get_onecircuitvalidation = asyncHandler(async(req, res, next) => {
  try {
    const idcircuitvalidation  = req.params.id;
    const circuitvalidation_ = await circuitvalidationservice.get_onecircuitvalidation(idcircuitvalidation);
    res.json({ success: true, data: circuitvalidation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée une nouveau circuit
 */
module.exports.create_circuitvalidation = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_circuitvalidation = await circuitvalidationservice.create_circuitvalidation(data);
    res.status(201).json({ success: true, data: new_circuitvalidation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour un Worflow existante
 */
module.exports.update_circuitvalidation = asyncHandler(async(req, res, next) => {
  try {
    const idcircuitvalidation  = req.params.id;
    const circuitvalidation_ = await circuitvalidationservice.update_circuitvalidation(idcircuitvalidation, req.body);
    res.json({ success: true, data: circuitvalidation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime un Worflow
 */
module.exports.delete_circuitvalidation = asyncHandler(async(req, res, next) => {
  const pool = await db.connectDB();
  const transaction = await  pool.transaction();
  const idcircuitvalidation = req.params.id;
  try {
    const circuit_etapes = await deleteCircuitEtapes(idcircuitvalidation);
    console.log(circuit_etapes);
    const circuitvalidation_ = await circuitvalidationservice.delete_circuitvalidation(idcircuitvalidation);
    res.json({ success: true, message: "Worflow supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

module.exports.createworkflow = asyncHandler(async(req,res,next) => {
  const { etapes, ...circuit } = req.body;
  const pool = await db.connectDB();
  const transaction = await  pool.transaction();

  try {
    await transaction.begin();

    const circuitId = await insertCircuit(circuit, transaction);

    for (const etape of etapes) {
      const etapeId = await insertEtape(circuitId, etape, transaction);

      for (const v of etape.validateurs) {
        await insertEtapeValidateur(etapeId, v.idutilisateur, transaction);
      }
    }

    await transaction.commit();
    res.json({ success: true });
  } catch (e) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: e.message });
  }
});

//Paramétrage spécifique pour le workflow 
async function insertCircuit(circuit, transaction) {
  const request = transaction.request();

  // Exemple d'insertion, adapte les noms de colonnes et table à ta base
  const result = await request
    .input('codecircuitvalidation', circuit.codecircuitvalidation)
    .input('typeentite', circuit.typeentite)
    .input('typeaction', circuit.typeaction)
    .input('idsociete', circuit.idsociete)
    .input('idsite', circuit.idsite)
    // Autres inputs selon tes colonnes
    .query(`
      INSERT INTO circuitvalidation (codecircuitvalidation, typeentite, typeaction, idsociete, idsite)
      OUTPUT INSERTED.idcircuitvalidation
      VALUES (@codecircuitvalidation, @typeentite, @typeaction, @idsociete, @idsite)
    `);

  return result.recordset[0].idcircuitvalidation; // retourne l'id inséré
}

async function insertEtape(circuitId, etape, transaction) {
  const request = transaction.request();

  const result = await request
    .input('idcircuitvalidation', circuitId)
    .input('rang', etape.rang)
    .input('nombrevalidateur', etape.nombrevalidateur)
    // autres inputs si besoin
    .query(`
      INSERT INTO Circuitetape (idcircuitvalidation, rang,nombrevalidateur)
      OUTPUT INSERTED.idcircuitetape
      VALUES (@idcircuitvalidation, @rang,@nombrevalidateur)
    `);

  return result.recordset[0].idcircuitetape;
}

async function insertEtapeValidateur(etapeId, idutilisateur, transaction) {
  const request = transaction.request();

  await request
    .input('idcircuitetape', etapeId)
    .input('idutilisateur', idutilisateur)
    .query(`
      INSERT INTO etapevalidateur (idcircuitetape, idutilisateur)
      VALUES (@idcircuitetape, @idutilisateur)
    `);
}


module.exports.updateworkflow = asyncHandler(async (req, res) => {
  const { idcircuitvalidation, etapes, ...circuit } = req.body;
  const pool = await db.connectDB();
  const transaction = pool.transaction();

  try {
    await transaction.begin();


    await updateCircuit(idcircuitvalidation, circuit, transaction);

    await deleteCircuitEtapes(idcircuitvalidation, transaction);

    for (const etape of etapes) {
      const etapeId = await insertEtape(idcircuitvalidation, etape, transaction);

      for (const v of etape.validateurs) {
        await insertEtapeValidateur(etapeId, v.idutilisateur, transaction);
      }
    }

    await transaction.commit();
    res.json({ success: true });

  } catch (e) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: e.message });
  }
});

async function updateCircuit(id, circuit, transaction) {
  await transaction.request()
    .input('idcircuitvalidation', id)
    .input('codecircuitvalidation', circuit.codecircuitvalidation)
    .input('typeentite', circuit.typeentite)
    .input('typeaction', circuit.typeaction)
    .input('idsociete', circuit.idsociete)
    .input('idsite', circuit.idsite)
    .query(`
      UPDATE circuitvalidation
      SET codecircuitvalidation = @codecircuitvalidation,
          typeentite = @typeentite,
          typeaction = @typeaction,
          idsociete = @idsociete,
          idsite = @idsite
      WHERE idcircuitvalidation = @idcircuitvalidation
    `);
}

async function deleteCircuitEtapes(idcircuitvalidation) {
  try {
     const pool = await db.connectDB();
     const result = await pool.request()
    .input('idcircuitvalidation', idcircuitvalidation)
    .query(`
      DELETE ev
      FROM etapevalidateur ev
      JOIN circuitetape ce ON ce.idcircuitetape = ev.idcircuitetape
      WHERE ce.idcircuitvalidation = @idcircuitvalidation;

      DELETE FROM circuitetape
      WHERE idcircuitvalidation = @idcircuitvalidation;
    `);
  } catch (error) {
     console.log(error);
  }
 
}

module.exports.duplicateworkflow = asyncHandler(async (req, res) => {
  const { etapes, ...circuit } = req.body;
  const pool = await db.connectDB();
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    // Nouveau code (exemple)
    circuit.codecircuitvalidation += '_COPY';

    const newCircuitId = await insertCircuit(circuit, transaction);

    for (const etape of etapes) {
      const etapeId = await insertEtape(newCircuitId, etape, transaction);

      for (const v of etape.validateurs) {
        await insertEtapeValidateur(etapeId, v.idutilisateur, transaction);
      }
    }

    await transaction.commit();
    res.json({ success: true });

  } catch (e) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: e.message });
  }
});







