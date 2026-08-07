const express = require("express");
const router = express.Router();
const parametreController = require("../controllers/parametrecomptable.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");
const {
  upload,
  validateCsvColumns,
  cleanupUploadedFile,
} = require("../../../middlewares/csvUpload.middleware");

// CRUD motif
//router.get("/", motif_controller.get_motifs);
router.post(
  "/getall/",
  authmiddleware.authentificatetoken,
  parametreController.getParametreComptable,
);
router.post(
  "/save",
  authmiddleware.authentificatetoken,
  parametreController.saveParametreComptable,
);

router.get(
  "/correspondances",
  authmiddleware.authentificatetoken,
  parametreController.getAllCorrespondance,
);
router.get(
  "/correspondances/:id",
  authmiddleware.authentificatetoken,
  parametreController.getCorrespondanceById,
);
router.post(
  "/correspondances",
  authmiddleware.authentificatetoken,
  parametreController.createCorrespondance,
);
router.put(
  "/correspondances/:id",
  authmiddleware.authentificatetoken,
  parametreController.updateCorrespondance,
);
router.delete(
  "/correspondances/:id",
  authmiddleware.authentificatetoken,
  parametreController.hardDelete,
); // soft delete
// router.delete('/:id/hard', controller.hardDelete); // physique si besoin

router.put(
  "/entite-site",
  authmiddleware.authentificatetoken,
  parametreController.saveAnalytiqueEntiteSite,
);
router.put(
  "/table-correspondance",
  authmiddleware.authentificatetoken,
  parametreController.saveAnalytiqueTable,
);
router.put(
  "/axesecond",
  authmiddleware.authentificatetoken,
  parametreController.saveAxeSecond,
);
router.post(
  "/save-axis-labels",
  authmiddleware.authentificatetoken,
  parametreController.saveAxisLabel,
);

/**
 * Route d'import CSV pour la correspondance analytique
 * Colonnes requises: idcentreanalytique, correspondance
 */
router.post(
  "/correspondances/import-csv",
  authmiddleware.authentificatetoken,
  upload.single("file"), // 'file' est le nom du champ dans le formulaire
  validateCsvColumns(["codecentreanalytique", "correspondance"]),
  cleanupUploadedFile(),
  parametreController.importCorrespondancesFromCsv,
);

module.exports = router;
