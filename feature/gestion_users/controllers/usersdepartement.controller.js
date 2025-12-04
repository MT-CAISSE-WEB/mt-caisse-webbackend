const asyncHandler = require("../../../shared/middlewares/async");
const utilisateurdepartementservice = require("../services/usersdepartement.service");

// ➤ GET ALL
module.exports.get_all_UtilisateurDepartements = asyncHandler(async (req, res) => {
  const utilisateurDepartements = await utilisateurdepartementservice.get_all_UtilisateurDepartements();
  res.status(200).json({ success: true, data: utilisateurDepartements });
});

// ➤ GET ONE
module.exports.get_oneutilisateurdepartement = asyncHandler(async (req, res, next) => {
  const iduserdepartement = req.params.id;
  const utilisateurDepartement_ = await utilisateurdepartementservice.get_oneutilisateurdepartement(iduserdepartement);

  if (!utilisateurDepartement_) {
    return res.status(404).json({ success: false, message: "Aucun élément trouvé" });
  }

  res.status(200).json({ success: true, data: utilisateurDepartement_ });
});

// ➤ CREATE (important pour Postman)
module.exports.create_utilisateurdepartement = asyncHandler(async (req, res) => {
  const created = await utilisateurdepartementservice.create_utilisateurdepartement(req.body);
  res.status(201).json({ success: true, data: created });
});

// ➤ UPDATE
module.exports.update_utilisateurdepartement = asyncHandler(async (req, res) => {
  const updated = await utilisateurdepartementservice.update_UtilisateurDepartement(req.params.id, req.body);
  res.status(200).json({ success: true, data: updated });
});

// ➤ DELETE
module.exports.delete_utilisateurdepartement = asyncHandler(async (req, res) => {
  const deleted = await utilisateurdepartementservice.delete_UtilisateurDepartement(req.params.id);
  res.status(200).json({ success: true, message: "Affectation supprimée", data: deleted });
});
