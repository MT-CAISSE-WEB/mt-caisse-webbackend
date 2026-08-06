const demandeservice = require("../services/entetedemande.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");
const path = require("path");

/**
 * Liste toutes les demandes
 */
module.exports.getAll = asyncHandler(async (req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const search = req.query.search || null;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const status = req.query.status || null;
    const user = req.query.user || null;

    const demandes = await demandeservice.getAll({
      page,
      limit,
      search,
      status,
      user,
    });
    res.json({ success: true, data: demandes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Un demande existant par son id
 */
module.exports.getById = asyncHandler(async (req, res, next) => {
  try {
    const iddemande = req.params.id;
    const demande_ = await demandeservice.get_demande_by_id(iddemande);
    res.json({ success: true, data: demande_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée un nouveau demande
 */
module.exports.create = asyncHandler(async (req, res, next) => {
  try {
    const data = req.body;
    const new_demande = await demandeservice.create_demande(data);
    res.status(201).json({ success: true, data: new_demande });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour une demande existante
 */
module.exports.update = asyncHandler(async (req, res, next) => {
  try {
    const iddemande = req.params.id;
    const demande_ = await demandeservice.update_demande(iddemande, req.body);
    console.log(demande_);
    res.json({ success: true, data: demande_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime une demande
 */
module.exports.delete = asyncHandler(async (req, res, next) => {
  try {
    const iddemande = req.params.id;
    const demande_ = await demandeservice.delete_demande(iddemande);
    res.json({ success: true, message: "demande supprimé" });
  } catch (error) {
    console.log("Erreur", error)
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Validation d'une demande
 */
module.exports.validate = asyncHandler(async (req, res, next) => {
  try {
    const iddemande = req.params.id;
    const demande_ = await demandeservice.validate(iddemande, req.body);
    res.json({
      success: true,
      data: demande_,
      message: "Décision pris en compte",
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Demande a valider
 */
module.exports.getDemandeAvalider = asyncHandler(async (req, res, next) => {
  try {
    const idutilisateur = req.params.id;
    const demande_ = await demandeservice.get_demandeAvalider(idutilisateur);
    res.json({ success: true, data: demande_, message: "Demande a valider" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Validateurs des demandes
 */
module.exports.getValidateursCircuit = asyncHandler(async (req, res, next) => {
  try {
    const iddemande = req.params.id;
    const demande_ = await demandeservice.get_validateurCircuit(iddemande);
    res.json({
      success: true,
      data: demande_,
      message: "Validateurs du circuit",
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Detail budget des demandes
 */
module.exports.getDetailBudget = asyncHandler(async (req, res, next) => {
  try {
    const iddemande = req.params.id;
    const demande_ = await demandeservice.get_detailBudget(iddemande);
    res.json({
      success: true,
      data: demande_,
      message: "Details budget de la demande",
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Dernier teux de devise
 */
module.exports.gettauxrecent = asyncHandler(async (req, res, next) => {
  try {
    const { iddeviseorigine, iddevisedestination, datepiece } = req.body;
    const tauxrecents = await demandeservice.getDernierTaux(
      iddeviseorigine,
      iddevisedestination,
      datepiece,
    );
    res.json({ success: true, data: tauxrecents[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

const { upload } = require("../../../middlewares/upload/pjdemande");

/**
 * Upload de pièces jointes pour une demande
 */
module.exports.uploadFiles = asyncHandler(async (req, res, next) => {
  try {
    const iddemande = req.params.id;
    const files = req.files;
    const userId = "ADMIN";

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier à uploader",
      });
    }

    const result = await demandeservice.uploadFiles(iddemande, files, userId);

    res.status(201).json({
      success: true,
      data: result,
      message: `${result.length} fichier(s) uploadé(s) avec succès`,
    });
  } catch (error) {
    res.status(error.code === "DEMANDE_NOT_FOUND" ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Récupère toutes les pièces jointes d'une demande
 */
module.exports.getFiles = asyncHandler(async (req, res, next) => {
  try {
    const iddemande = req.params.id;
    const files = await demandeservice.getFiles(iddemande);

    res.json({ success: true, data: files });
  } catch (error) {
    res.status(error.code === "DEMANDE_NOT_FOUND" ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Supprime une pièce jointe d'une demande
 */
module.exports.deleteFile = asyncHandler(async (req, res, next) => {
  try {
    const { id: iddemande, idpiecejointe } = req.params;
    const userId = req.user?.idutilisateur || "ADMIN";

    const result = await demandeservice.deleteFile(
      iddemande,
      idpiecejointe,
      userId,
    );

    res.json({ success: true, message: result.message });
  } catch (error) {
    res.status(error.code === "FILE_NOT_FOUND" ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Télécharge un fichier (stream direct)
 * GET /api/demandes/download?path=uploads/demandes/xxx.pdf
 * OU
 * GET /uploads/demandes/xxx.pdf (si exposé statiquement)
 */
module.exports.downloadFile = asyncHandler(async (req, res, next) => {
  try {
    // Récupérer le chemin depuis query param
    const filePath = req.query.path;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: "Chemin du fichier manquant",
      });
    }

    const decodedPath = decodeURIComponent(filePath);

    const sanitizedPath = path
      .normalize(decodedPath)
      .replace(/^(\.\.(\/|\\|$))+/, "");

    const allowedDirs = ["uploads/demandes", "uploads"];
    const isAllowed = allowedDirs.some((dir) => sanitizedPath.startsWith(dir));

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé",
      });
    }

    const { stream, stats, mimetype, nomfichier } =
      await demandeservice.downloadFile(sanitizedPath);

    res.setHeader("Content-Type", mimetype);
    res.setHeader("Content-Length", stats.size);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(nomfichier)}"`,
    );
    res.setHeader("Cache-Control", "public, max-age=3600");

    stream.pipe(res);
  } catch (error) {
    console.error("Erreur downloadFile:", error);
    res.status(error.code === "FILE_NOT_FOUND" ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
});

// Fonction de download de plusieurs fichiers

module.exports.downloadAllFiles = asyncHandler(async (req, res) => {
  try {
    const iddemande = req.params.id;

    const result = await demandeservice.downloadAllFiles(iddemande);

    if (result.isZip) {
      // Cas ZIP (plusieurs fichiers)
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(result.filename)}"`,
      );
      res.setHeader("Content-Length", result.buffer.length);
      res.setHeader("X-Total-Files", result.totalFiles);
      res.send(result.buffer);
    } else {
      // Cas fichier unique
      res.setHeader("Content-Type", result.mimetype);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(result.filename)}"`,
      );
      res.setHeader("Content-Length", result.buffer.length);
      res.send(result.buffer);
    }
  } catch (error) {
    console.error("❌ Erreur downloadAllFiles:", error);

    if (error.message.includes("Aucune pièce jointe")) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erreur lors du téléchargement",
        error: error.message,
      });
    }
  }
});
