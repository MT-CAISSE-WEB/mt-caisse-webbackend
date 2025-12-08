const circuitvalidateurservice = require("../services/circuitvalidateur.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste tous les Worflow
 */
module.exports.get_circuitvalidateurs = asyncHandler(async(req, res, next) => {
  try {
    const circuitvalidateurs = await circuitvalidateurservice.get_all_circuitvalidateur();
    res.json({ success: true, data: circuitvalidateurs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 */
module.exports.get_onecircuitvalidateur = asyncHandler(async(req, res, next) => {
  try {
    const idcircuitvalidateur  = req.params.id;
    const circuitvalidateur_ = await circuitvalidateurservice.get_onecircuitvalidateur(idcircuitvalidateur);
    res.json({ success: true, data: circuitvalidateur_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée une nouveau circuit
 */
module.exports.create_circuitvalidateur = asyncHandler(async (req, res, next) => {
  try {
    const { codecircuitvalidateur, idutilisateur, idsociete, idcircuitvalidation, rangvalidation, createdby } = req.body;

    if (!codecircuitvalidateur) {
      return res.status(400).json({
        success: false,
        message: "Le champ codecircuitvalidateur est requis."
      });
    }

    const circuitvalidateur_ = await circuitvalidateurservice.create_circuitvalidateur(req.body);

    res.json({
      success: true,
      message: "Circuit validateur créé",
      data: circuitvalidateur_
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


/**
 * Met à jour un Worflow existante
 */
module.exports.update_circuitvalidateur = asyncHandler(async(req, res, next) => {
  try {
    const idcircuitvalidateur  = req.params.id;
    const circuitvalidateur_ = await circuitvalidateurservice.update_circuitvalidateur(idcircuitvalidateur, req.body);
    res.json({ success: true, data: circuitvalidateur_ });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Supprime un Worflow
 */
module.exports.delete_circuitvalidateur = asyncHandler(async(req, res, next) => {
  try {
    const idcircuitvalidateur = req.params.id;
    const circuitvalidateur_ = await circuitvalidateurservice.delete_circuitvalidateur(idcircuitvalidateur);
    res.json({ success: true, message: "Worflow supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
