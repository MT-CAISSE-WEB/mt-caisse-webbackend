const {
  JustificatifOperation,
  Devise,
  EnteteOperationCaisse,
  DetailsJustificatifOperation,
  TypeOperation,
} = require("../models");
const sequelize = require("../../../config/database");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
const ecritureservice = require("../../gestion_comptabilisation/services/ecriture.service");
const typeoperationservice = require("../../gestion_operation_caisse/services/operation.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");
const pdfjs = require("../../../shared/utils/pdf");
const path = require("path");
const justificatifservice = require("../services/justificatifop.service");

/* ===== CREATE ===== */
exports.create = async (req, res) => {
  try {
    const justificatif = await JustificatifOperation.create(req.body);
    res.status(201).json({ success: true, data: justificatif });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ===== GET ALL avec Foreign Keys ===== */
exports.findAll = async (req, res) => {
  try {
    const data = await JustificatifOperation.findAll({
      include: [
        { model: Devise, as: "devise" },
        { model: EnteteOperationCaisse, as: "operation" },
      ],
    });

    res.json({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ===== GET ONE ===== */
exports.findOne = async (req, res) => {
  try {
    const justificatif = await JustificatifOperation.findByPk(req.params.id, {
      include: ["devise", "operation"],
    });

    if (!justificatif)
      return res.status(404).json({ success: false, message: "Introuvable" });

    res.json({ success: true, message: "Introuvable", data: justificatif });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ===== UPDATE ===== */
exports.update = async (req, res) => {
  try {
    await JustificatifOperation.update(req.body, {
      where: { idjustificatifoperation: req.params.id },
    });

    res.json({ success: true, message: "Mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ===== DELETE ===== */
exports.delete = async (req, res) => {
  try {
    await JustificatifOperation.destroy({
      where: { idjustificatifoperation: req.params.id },
    });

    res.json({ success: true, message: "Supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.createFull = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      details,
      idsite,
      idsociete,
      retour_caisse,
      caisses,
      date: datejustificatif,
      ...justificatifData
    } = req.body;

    /* ======================================================
       0. VALIDATIONS DE BASE
    ====================================================== */

    if (!justificatifData.idoperation) {
      throw new Error("idoperation est obligatoire.");
    }

    /* ======================================================
       1. GÉNÉRATION CODE
    ====================================================== */

    let codejustificatif = null;

    if (!retour_caisse) {
      const lastPiece = await JustificatifOperation.findOne({
        order: [["createdat", "DESC"]],
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      let compteur = 1;

      if (lastPiece && lastPiece.codejustificatif) {
        const lastNumber = parseInt(
          lastPiece.codejustificatif.split("-")[1],
          10,
        );
        compteur = isNaN(lastNumber) ? 1 : lastNumber + 1;
      }

      codejustificatif = `PIECE-${String(compteur).padStart(6, "0")}`;
    }

    /* ======================================================
       2. CRÉATION JUSTIFICATIF
    ====================================================== */

    let justificatif = null;
    let taux = 1;

    // ✔️ INTERDICTION si retour caisse
    if (!retour_caisse) {
      justificatif = await JustificatifOperation.create(
        {
          ...justificatifData,
          codejustificatif,
        },
        { transaction },
      );

      taux = justificatif.taux || 1;
    }

    /* ======================================================
       3. DÉTAILS
    ====================================================== */

    let totalDetails = 0;

    if (!retour_caisse && justificatif && details?.length > 0) {
      const detailsToInsert = details.map((d) => {
        if (!d.idnature) {
          throw new Error("Chaque détail doit contenir idnature.");
        }

        if (!d.montantdetail || d.montantdetail <= 0) {
          throw new Error("Montant détail invalide.");
        }

        const montantref = d.montantdetail * taux;
        totalDetails += montantref;

        return {
          iddetailsjustificatifoperation: uuidv4(),
          idjustificatif: justificatif.idjustificatifoperation,
          idnature: d.idnature,
          idcentreanalytique: d.idcentreanalytique || null,
          idtiers: d.idtiers || null,
          montantdetail: d.montantdetail,
          montantref,
          createdby: justificatif.createdby,
        };
      });

      await DetailsJustificatifOperation.bulkCreate(detailsToInsert, {
        transaction,
      });
    }

    /* ======================================================
       4. RETOUR CAISSE
    ====================================================== */
    let totalCaisses = 0;

    let createdCaisseOps = [];

    if (retour_caisse === true) {
      if (!caisses || caisses.length === 0) {
        throw new Error(
          "Le tableau caisses est obligatoire lorsque retour_caisse=true",
        );
      }

      const operationId = justificatif
        ? justificatif.idoperation
        : justificatifData.idoperation;

      const createdBy = justificatif
        ? justificatif.createdby
        : justificatifData.createdby;

      // ✔️ FILTRAGE montant > 0
      const caissesValides = caisses.filter((c) => c.montantcaisse > 0);

      const caissesToInsert = caissesValides.map((c) => {
        if (!c.idcaisse || c.montantcaisse === undefined || !c.taux) {
          throw new Error("Données caisse invalides.");
        }

        const montantref = c.montantcaisse * c.taux;
        totalCaisses += montantref;

        return {
          idtypeoperation: uuidv4(),
          codtypeoperation: "encaissement",
          idperiode: c.idperiode,
          idsociete,
          idsite,
          idcaisse: c.idcaisse,
          idoperation: operationId,
          montant: c.montantcaisse,
          taux: c.taux,
          montantref,
          createdby: createdBy,
        };
      });

      if (caissesToInsert.length > 0) {
        createdCaisseOps = await TypeOperation.bulkCreate(caissesToInsert, { transaction });
      }
    }

    /* ======================================================
       5. TOTAL JUSTIFIÉ GLOBAL
    ====================================================== */

    const operationId = justificatif
      ? justificatif.idoperation
      : justificatifData.idoperation;

    const totalJustifieRaw =
      (await DetailsJustificatifOperation.sum("montantref", {
        where: {
          idjustificatif: {
            [Op.in]: sequelize.literal(`(
              SELECT idjustificatifoperation
              FROM JustificatifOperation
              WHERE idoperation = '${operationId}'
            )`),
          },
        },
        transaction,
      })) || 0;

    const totalJustifie = Number(totalJustifieRaw);

    /* ======================================================
       6. OPÉRATION
    ====================================================== */

    const operation = await EnteteOperationCaisse.findByPk(operationId, {
      transaction,
    });

    if (!operation) {
      throw new Error("Opération introuvable.");
    }

    totalCaisses = Number(
      await TypeOperation.sum("montantref", {
        where: {
          idoperation: operationId,
          codtypeoperation: "encaissement",
        },
        transaction,
      }) || 0
    );

    /* ======================================================
       7. STATUT (LOGIQUE MÉTIER CORRIGÉE)
    ====================================================== */

    let statut = 0;
    console.log("Total des caisses ", totalCaisses);
    const totalGlobal = totalJustifie + totalCaisses;
    const operationRef = operation.montant * operation.tauxoperation;

    if (totalGlobal > 0 && totalGlobal < operationRef) {
      statut = 1;
    } else if (totalGlobal === Number(operationRef)) {
      statut = 2;
    }else{
      console.log("Erreur calcul du reste justificatif");
    }

    /* ======================================================
       8. UPDATE
    ====================================================== */

    await EnteteOperationCaisse.update(
      { justifiee: statut },
      {
        where: { idoperation: operationId },
        transaction,
      },
    );

    await transaction.commit();

    if (retour_caisse === true) {
      // comptabilisation
      const idsTypeOp = createdCaisseOps.map(t => t.idtypeoperation);
      await Promise.all(
        idsTypeOp.map(idTypeOp => ecritureservice.GenererRetour(operationId, idTypeOp))
      );
    } else {
      // comptabilisation
      await ecritureservice.GenererJustificatif(
        justificatif.idjustificatifoperation,
      );
    }

    /* ======================================================
       9. RÉPONSE
    ====================================================== */

    const statut_en_lettre =
      statut === 0
        ? "Non justifiée"
        : statut === 1
          ? "Partiellement justifiée"
          : "Justifiée";

    return res.status(201).json({
      success: true,
      message: "Opération traitée avec succès",
      statut_justification: statut,
      statut_en_lettre,
      justificatif,
    });
  } catch (error) {
    console.log('Erreur:', error)
    await transaction.rollback();

    return res.status(500).json({
      success: false,
      message: "Erreur lors du traitement",
      error: error.message,
    });
  }
};

module.exports.get_docjustificatif = asyncHandler(async (req, res) => {
  try {
    const data = await typeoperationservice.getDataDocumentJustificatif(req.params.id);
    const pdfBuffer = await pdfjs.genererDocPdf(data);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=doc-justificatif.pdf");
    res.send(pdfBuffer);
  } catch (e) {
    res.status(500).json({ message: "Erreur génération PDF" });
  }
});

const { upload } = require("../../../middlewares/upload/pjjustificatif");

/**
 * Upload de pièces jointes pour une demande
 */
module.exports.uploadFiles = asyncHandler(async (req, res, next) => {
  try {
    const idjustificatifoperation = req.params.id;
    const files = req.files;
    const userId = "ADMIN";

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier à uploader",
      });
    }

    const result = await justificatifservice.uploadFiles(idjustificatifoperation, files, userId);

    res.status(201).json({
      success: true,
      data: result,
      message: `${result.length} fichier(s) uploadé(s) avec succès`,
    });
  } catch (error) {
    res.status(400).json({
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
    const idjustificatifoperation = req.params.id;
    const files = await justificatifservice.getFiles(idjustificatifoperation);

    res.json({ success: true, data: files });
  } catch (error) {
    console.error("Erreur get file:", error)
    res.status(500).json({
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
    const { id: idjustificatifoperation, idpiecejointe } = req.params;
    const userId = req.user?.idutilisateur || "ADMIN";

    const result = await justificatifservice.deleteFile(
      idjustificatifoperation,
      idpiecejointe,
      userId,
    );

    res.json({ success: true, message: result.message });
  } catch (error) {
    res.status(400).json({
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

    const allowedDirs = ["uploads/justificatifs", "uploads"];
    const isAllowed = allowedDirs.some((dir) => sanitizedPath.startsWith(dir));

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé",
      });
    }

    const { stream, stats, mimetype, nomfichier } =
      await justificatifservice.downloadFile(sanitizedPath);

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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Fonction de download de plusieurs fichiers

module.exports.downloadAllFiles = asyncHandler(async (req, res) => {
  try {
    const idjustificatifoperation = req.params.id;

    const result = await justificatifservice.downloadAllFiles(idjustificatifoperation);

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
