const etapevalidateurservice = require("../services/etapevalidateur.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste tous les Worflow
 */
module.exports.get_etapevalidateur = asyncHandler(async(req, res, next) => {
  try {
    const etapevalidateurs = await etapevalidateurservice.get_all_etapevalidateur();
    res.json({ success: true, data: etapevalidateurs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 */
module.exports.get_oneetapevalidateur = asyncHandler(async(req, res, next) => {
  try {
    const idcircuitetape  = req.params.id['idcircuitetape'];
    const idutilisateur  = req.params.id['idutilisateur'];
    const etapevalidateur_ = await etapevalidateurservice.get_oneetapevalidateur(idcircuitetape,idutilisateur);
    res.json({ success: true, data: etapevalidateur_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée une nouveau circuit
 */
module.exports.create_etapevalidateur = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_etapevalidateur = await etapevalidateurservice.create_etapevalidateur(data);
    res.status(201).json({ success: true, data: new_etapevalidateur });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour un Worflow existante
 */
module.exports.update_etapevalidateur = asyncHandler(async(req, res, next) => {
  try {
    const idcircuitetape  = req.params.id['idcircuitetape'];
    const idutilisateur  = req.params.id['idutilisateur'];
    const etapevalidateur_ = await etapevalidateurservice.update_etapevalidateur(idcircuitetape,idutilisateur);
    res.json({ success: true, data: etapevalidateur_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime un Worflow
 */
module.exports.delete_etapevalidateur = asyncHandler(async(req, res, next) => {
  try {
    const idcircuitetape = req.params.id['idcircuitetape'];
    const idutilisateur = req.params.id['idutilisateur'];
    const etapevalidateur_ = await etapevalidateurservice.delete_etapevalidateur(idcircuitetape,idutilisateur);
    res.json({ success: true, message: "Worflow supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
