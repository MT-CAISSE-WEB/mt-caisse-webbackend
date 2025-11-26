const journalmodel = require("../models/journal.model");
const { v4: uuidv4 } = require('uuid');

let journal = new journalmodel();
let journals = [];

async function get_all_journals() {
  const result = await journal.get_alljournals();
  journals = result.recordset.map(item => new journalmodel(
    item.idjournal,
    item.codejournal, 
    item.designation, 
    item.actif, 
    item.createdat, 
    item.createdby, 
    item.updatedat,  
    item.updatedby));
  return journals;
}

async function create_journal(data) {
  if (!data.codejournal || !data.designation) {
    throw new Error("Tous les champs (codejournal, designation) sont requis.");
  }

  const today = new Date();
  const newjournal = new journalmodel(
    uuidv4(), 
    data.codejournal, 
    data.designation,  
    data.actif,  
    data.createdat || today, 
    data.createdby || 'System', 
    data.updatedat, 
    data.updatedby);
  const recorded = await newjournal.create_journalmodel(newjournal);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }

  return recorded.data;
}

async function get_by_idjournal(idjournal) {
  if (!idjournal) {
    throw new Error("Erreur de donnée");
  }

  try {
    const journal_ = await journal.get_onejournal(idjournal);
    return journal_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function update_journal(idjournal, data) {
  if (!idjournal || !data.codejournal) {
    throw new Error("Erreur de donnée");
  }

  try {
    const journal_ = await journal.update_journal(data.codejournal, data);
    return journal_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
  
}

async function delete_journal(idjournal) {
  if (!idjournal) {
    throw new Error("Erreur de donnée");
  }

   try {
    const journal_ = await journal.delete_journal(idjournal);
    if (!journal_.success) {
      throw new Error(journal_.message);
    }
    return journal_;
   } catch (err) {
    throw err;
   }
}

module.exports = {
  get_all_journals,
  get_by_idjournal,
  create_journal,
  update_journal,
  delete_journal
};
