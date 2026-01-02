const circuitetapemodel = require("../models/circuitetape.model");
const { v4: uuidv4 } = require('uuid');

let circuitetape = new circuitetapemodel();
let circuitetapes = [];

async function get_all_circuitetape() {
  const result = await circuitetape.get_allcircuitetape();
  circuitvalidations = result.recordset.map(item => new circuitetapemodel(
    item.circuitetape,
    item.idcircuitvalidation,
    item.ordre,
    item.nombrevalidateur,
    item.createdat,  
    item.createdby,
    item.updatedat, 
    item.updatedby
  ));
  return circuitetapes;
}


async function create_circuitetape(data) {

  const today = new Date();

  const newcircuitetape = new circuitetapemodel(
    uuidv4(),
    data.idcircuitetape,
    data.idcircuitvalidation,
    data.ordre,
    data.nombrevalidateur,
    data.createdat || today,
    data.createdby || 'System',
    data.updatedat || today,
    data.updatedby || null
  );

  const recorded = await newcircuitetape.create_circuitetapemodel();

  if (!recorded.success) throw new Error(recorded.message);

  return recorded;
}


async function get_onecircuitetape(idcircuitetape) {
  if (!idcircuitetape) {
    throw new Error("Erreur de donnée");
  }

  try {
    const circuitetape_ = await circuitetape.get_onecircuitetape(idcircuitetape);
    return circuitetape_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function update_circuitetape(idcircuitetape, data) {
  if (!idcircuitetape || !data.idcircuitvalidation) {
    throw new Error("Erreur de donnée");
  }

  try {
    const circuitetape_ = await circuitetape.update_circuitetape(idcircuitetape, data);
    return circuitetape_;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function delete_circuitetape(idcircuitetape) {
   try {
    const circuitetape_ = await circuitetape.delete_circuitetape(idcircuitetape);
    if (!circuitetape_.success) {
      throw new Error(circuitetape_.message);
    }
    return circuitetape_;
   } catch (err) {
    throw err;
   }
}

module.exports = {
  get_all_circuitetape,
  get_onecircuitetape,
  create_circuitetape,
  update_circuitetape,
  delete_circuitetape
};