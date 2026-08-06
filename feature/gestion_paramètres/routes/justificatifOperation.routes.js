const express = require("express");
const router = express.Router();

const controller = require("../controllers/justificatifOperation.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/justificatifpj-download",authmiddleware.authentificatetoken, controller.downloadFile);

router.post("/create", authmiddleware.authentificatetoken, controller.create);
router.get("/", authmiddleware.authentificatetoken, controller.findAll);
router.get("/:id", authmiddleware.authentificatetoken,  controller.findOne);
router.put("/update/:id", authmiddleware.authentificatetoken, controller.update);
router.delete("/delete/:id", authmiddleware.authentificatetoken, controller.delete);
router.post("/full/create", authmiddleware.authentificatetoken, controller.createFull);

router.get("/full/document/:id", authmiddleware.authentificatetoken, controller.get_docjustificatif);

const {
  upload,
  fixmimetype,
} = require("../../../middlewares/upload/pjjustificatif");
// POUR LES PIÈCES JOINTES

router.get(
  "/:id/justificatif-pieces-jointes/download-all",
  authmiddleware.authentificatetoken,
  controller.downloadAllFiles,
);

router.post(
  "/:id/justificatif-pieces-jointes",
  upload.array("files", parseInt(10)),
  fixmimetype,
  controller.uploadFiles,
);

router.get("/:id/justificatif-pieces-jointes", authmiddleware.authentificatetoken, controller.getFiles);
router.delete(
  "/:id/justificatif-pieces-jointes/:idpiecejointe",
  authmiddleware.authentificatetoken,
  controller.deleteFile,
);

module.exports = router;
