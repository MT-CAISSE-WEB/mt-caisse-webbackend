const pieceJointeservice = require("../services/piecejointe.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste tous les pieceJointes
 */
module.exports.get_pieceJointes = asyncHandler(async(req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const search = req.query.search || null;
    const limit = req.query.limit || null;
    const actif = req.query.actif || null; 
    const pieceJointes = await pieceJointeservice.getall({page, limit , search, actif});
    res.json({ success: true, data: pieceJointes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Un pieceJointe existant par son id
 */
// module.exports.get_onepieceJointe = asyncHandler(async(req, res, next) => {
//   try {
//     const idpieceJointe  = req.params.id;
//     const pieceJointe_ = await pieceJointeservice.getOne(idpieceJointe);
//     res.json({ success: true, data: pieceJointe_ });
//   } catch (error) {
//     res.status(404).json({ success: false, message: error.message });
//   }
// });

/**
 * Crée un nouveau pieceJointe
 */
module.exports.createpieceJointe = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const pieceJointe = await pieceJointeservice.create(data);
    res.status(201).json({ success: true, data: pieceJointe });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour un pieceJointe existante
 */
// module.exports.update_pieceJointe = asyncHandler(async(req, res, next) => {
//   try {
//     const idpieceJointe  = req.params.id;
//     const pieceJointe_ = await pieceJointeservice.update(idpieceJointe, req.body);
//     res.json({ success: true, data: pieceJointe_ });
//   } catch (error) {
//     res.status(404).json({ success: false, message: error.message });
//   }
// });

/**
 * Supprime un pieceJointe
 */
module.exports.delete_pieceJointe = asyncHandler(async(req, res, next) => {
  try {
    const idpieceJointe = req.params.id;
    const pieceJointe_ = await pieceJointeservice.delete_piecejointe(idpieceJointe);
    res.json({ success: true, message: "pieceJointe supprimé" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
