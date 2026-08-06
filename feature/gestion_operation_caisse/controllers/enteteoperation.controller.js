const enteteoperationservice = require("../services/enteteoperation.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");
const path = require("path");

/**
 * Liste toutes les enteteoperations
 */
module.exports.get_enteteoperations = asyncHandler(async (req, res, next) => {
  try {
    const enteteoperations =
      await enteteoperationservice.get_all_enteteoperations();
    res.json({ success: true, data: enteteoperations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Une enteteoperation existant par son id
 */
module.exports.get_oneenteteoperation = asyncHandler(async (req, res, next) => {
  try {
    const identeteoperation = req.params.id;
    const enteteoperation_ =
      await enteteoperationservice.get_by_identeteoperation(identeteoperation);
    res.json({ success: true, data: enteteoperation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée une nouvelle enteteoperation
 */
module.exports.create_enteteoperation = asyncHandler(async (req, res, next) => {
  try {
    const data = req.body;
    const new_enteteoperation =
      await enteteoperationservice.create_enteteoperation(data);
    res.status(201).json({
      success: true,
      data: new_enteteoperation,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour une enteteoperation existante
 */
module.exports.update_enteteoperation = asyncHandler(async (req, res, next) => {
  try {
    const identeteoperation = req.params.id;
    const enteteoperation_ =
      await enteteoperationservice.update_enteteoperation(
        identeteoperation,
        req.body,
      );
    res.json({ success: true, data: enteteoperation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime une enteteoperation
 */
module.exports.delete_enteteoperation = asyncHandler(async (req, res, next) => {
  try {
    const identeteoperation = req.params.id;
    const enteteoperation_ =
      await enteteoperationservice.delete_enteteoperation(identeteoperation);
    res.json({ success: true, message: "entete operation supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Annule une enteteoperation
 */
module.exports.cancel_enteteoperation = asyncHandler(async (req, res, next) => {
  try {
    const data = req.body;
    console.log("Data to cancel", data)
    const new_enteteoperation =
      await enteteoperationservice.cancel_enteteoperation(data);
    res.status(201).json({ success: true, data: new_enteteoperation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Upload de pièces jointes pour une demande
 */
module.exports.uploadFiles = asyncHandler(async (req, res, next) => {
  try {
    const idoperation = req.params.id;
    const files = req.files;
    const userId = "ADMIN";

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier à uploader",
      });
    }

    const result = await enteteoperationservice.uploadFiles(
      idoperation,
      files,
      userId,
    );

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
 * Récupère toutes les pièces jointes d'une opération
 */
module.exports.getFiles = asyncHandler(async (req, res, next) => {
  try {
    const idoperation = req.params.id;
    const files = await enteteoperationservice.getFiles(idoperation);

    res.json({ success: true, data: files });
  } catch (error) {
    res.status(error.code === "DEMANDE_NOT_FOUND" ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Supprime une pièce jointe d'une opération
 */
module.exports.deleteFile = asyncHandler(async (req, res, next) => {
  try {
    const { id: idoperation, idpiecejointe } = req.params;
    const userId = req.user?.idutilisateur || "ADMIN";

    const result = await enteteoperationservice.deleteFile(
      idoperation,
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
 * GET /api/operations/download?path=uploads/operations/xxx.pdf
 * OU
 * GET /uploads/operations/xxx.pdf (si exposé statiquement)
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

    const allowedDirs = ["uploads/operations", "uploads"];
    const isAllowed = allowedDirs.some((dir) => sanitizedPath.startsWith(dir));

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé",
      });
    }

    const { stream, stats, mimetype, nomfichier } =
      await enteteoperationservice.downloadFile(sanitizedPath);

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

// Télécharger tous les fichiers
module.exports.downloadAllFiles = asyncHandler(async (req, res) => {
  try {
    const idoperation = req.params.id;

    const result = await enteteoperationservice.downloadAllFiles(idoperation);

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

/**
 * Télécharge toutes les pièces jointes d'une opération (opération + demande sélectionnée)
 * GET /api/operations/:id/operation-pieces-jointes/download-all?iddemande=xxx
 */
module.exports.downloadAllOperationFiles = async (req, res) => {
  try {
    // Récupérer l'idoperation depuis le param OU depuis le query param
    const idoperation = req.params.id || req.query.idoperation || null;
    const iddemande = req.query.iddemande || null;

    console.log("📥 downloadAllFiles - ID opération:", idoperation);
    console.log("📥 downloadAllFiles - ID demande (query):", iddemande);

    // Au moins un ID doit être fourni
    if (!idoperation && !iddemande) {
      return res.status(400).json({
        success: false,
        message: "Au moins un ID (opération ou demande) est requis",
      });
    }

    const result = await enteteoperationservice.downloadAllOperationFiles(
      idoperation,
      iddemande,
    );

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(result.filename)}"`,
    );
    res.setHeader("X-Total-Files", result.totalFiles);
    res.setHeader("X-Operation-Files", result.operationFiles);
    res.setHeader("X-Demande-Files", result.demandeFiles);
    res.setHeader("X-Has-Demande", result.hasDemande);

    res.send(result.buffer);
  } catch (error) {
    console.error("❌ Erreur downloadAllFiles:", error);
    res.status(error.message.includes("Aucune") ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Récupère toutes les pièces jointes d'une opération et de sa demande
 * GET /api/entete_operation/:idoperation/operation-demande-pieces-jointes
 */
module.exports.getOperationWithDemandePieces = async (req, res) => {
  try {
    const idoperation = req.params.id;
   

    const result = await enteteoperationservice.getOperationWithDemandePieces(
      idoperation,
    );

    res.json({
      success: true,
      data: {
        operationPJ: result.operationPJ,
        demandePJ: result.demandePJ,
        operationCount: result.operationCount,
        demandeCount: result.demandeCount,
        totalCount: result.totalCount,
        hasDemande: result.hasDemande,
        demandeInfo: result.demandeInfo,
        operationInfo: result.operationInfo,
      },
    });
  } catch (error) {
    console.error("❌ Erreur getOperationWithDemandePieces:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
