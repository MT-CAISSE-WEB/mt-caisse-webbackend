const express = require("express");
const router = express.Router();
const enteteoperation_controller = require("../controllers/enteteoperation.controller");
const operation_controller = require("../controllers/operation.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/operationpj-download", enteteoperation_controller.downloadFile);

// CRUD ENTETE OPERATION
router.get(
  "/",
  authmiddleware.authentificatetoken,
  enteteoperation_controller.get_enteteoperations,
);
router.get(
  "/:id",
  authmiddleware.authentificatetoken,
  enteteoperation_controller.get_oneenteteoperation,
);
router.get(
  "/caisse/solde",
  authmiddleware.authentificatetoken,
  operation_controller.get_soldecaisse,
);
router.post(
  "/create/",
  authmiddleware.authentificatetoken,
  enteteoperation_controller.create_enteteoperation,
);
router.put(
  "/update/:id",
  authmiddleware.authentificatetoken,
  enteteoperation_controller.update_enteteoperation,
);
router.delete(
  "/delete/:id",
  authmiddleware.authentificatetoken,
  enteteoperation_controller.delete_enteteoperation,
);
router.post(
  "/cancel/",
  authmiddleware.authentificatetoken,
  enteteoperation_controller.cancel_enteteoperation,
);

// PIÈCES JOINTES
const {
  upload,
  fixmimetype,
} = require("../../../middlewares/upload/pjoperation");
// POUR LES PIÈCES JOINTES

router.get(
  "/:id/operation-pieces-jointes/download-all",
  enteteoperation_controller.downloadAllFiles,
);

// Route pour télécharger toutes les PJ (opération + demande)
router.get(
  "/:id/operation-demande-pieces-jointes/download-all",
  enteteoperation_controller.downloadAllOperationFiles,
);

// Route pour télécharger uniquement les PJ d'une demande (sans opération)
router.get(
  "/demande-pieces-jointes/download-all",
  enteteoperation_controller.downloadAllOperationFiles,
);

router.post(
  "/:id/operation-pieces-jointes",
  upload.array("files", parseInt(10)),
  fixmimetype,
  enteteoperation_controller.uploadFiles,
);

router.get(
  "/:id/operation-pieces-jointes",
  enteteoperation_controller.getFiles,
);
router.delete(
  "/:id/operation-pieces-jointes/:idpiecejointe",
  enteteoperation_controller.deleteFile,
);

module.exports = router;