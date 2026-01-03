const circuitvalidationmodel = require("../models/circuitvalidation.model");
const { v4: uuidv4 } = require('uuid');

let circuitvalidation = new circuitvalidationmodel();
let circuitvalidations = [];

async function get_all_circuitvalidation() {
  const result = await circuitvalidation.get_allcircuitvalidation();
  circuitvalidations = result.recordset.map(item => new circuitvalidationmodel(
    item.idcircuitvalidation,
    item.codecircuitvalidation, 
    item.typeentite,
    item.typeaction,
    item.idsociete,
    item.idsite,
    item.iddepartement,
    item.nombrevalidateur,
    item.actif,
    item.createdat,  
    item.createdby,
    item.updatedat, 
    item.updatedby
  ));
  return circuitvalidations;
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
    data.iddepartement,
    data.nombrevalidateur,
    data.actif,
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
