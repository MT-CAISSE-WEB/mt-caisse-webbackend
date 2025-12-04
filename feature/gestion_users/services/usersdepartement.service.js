const UtilisateurDepartementModel = require("../models/usersdepartement.model");
const { v4: uuidv4 } = require("uuid");

// ➤ GET ALL
async function get_all_UtilisateurDepartements() {
  const model = new UtilisateurDepartementModel();
  const result = await model.get_all();
  return result.recordset || result;
}

// ➤ GET ONE
async function get_oneutilisateurdepartement(id) {
  const model = new UtilisateurDepartementModel(id);
  const result = await model.get_one();
  return result.data || null;
}

// ➤ CREATE
async function create_utilisateurdepartement(data) {
  const today = new Date();

  const model = new UtilisateurDepartementModel(
    data.iduserdepartement || uuidv4(),
    data.idutilisateur,
    data.iddepartement,
    data.idsociete,
    data.debutactivite || today,
    data.finactivite || null,
    today,
    data.createdby || "System",
    today,
    data.updatedby || "System"
  );

  return await model.create();
}

// ➤ UPDATE
async function update_UtilisateurDepartement(id, data) {
  // On instancie avec l’ID pour setter this.iduserdepartement
  const model = new UtilisateurDepartementModel(id);

  return await model.update({
    idutilisateur: data.idutilisateur,
    iddepartement: data.iddepartement,
    idsociete: data.idsociete,
    debutactivite: data.debutactivite,
    finactivite: data.finactivite,
    updatedat: new Date(),
    updatedby: data.updatedby || "System"
  });
}

// ➤ DELETE
async function delete_UtilisateurDepartement(id) {
  const model = new UtilisateurDepartementModel(id);
  return await model.delete();
}

module.exports = {
  get_all_UtilisateurDepartements,
  get_oneutilisateurdepartement,
  create_utilisateurdepartement,
  update_UtilisateurDepartement,
  delete_UtilisateurDepartement
};
