const express = require("express");
const router = express.Router();
const controller = require("../controllers/entetedemande.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/demandepj-download", controller.downloadFile);

router.post("/create", authmiddleware.authentificatetoken, controller.create); // CREATE
router.get("/", authmiddleware.authentificatetoken, controller.getAll); // READ ALL
router.get("/:id", authmiddleware.authentificatetoken, controller.getById); // READ ONE BY ID
router.put(
  "/update/:id",
  authmiddleware.authentificatetoken,
  controller.update,
); // UPDATE
router.post(
  "/validate/:id",
  authmiddleware.authentificatetoken,
  controller.validate,
); // UPDATE
router.post(
  "/tauxdevise/recent",
  authmiddleware.authentificatetoken,
  controller.gettauxrecent,
); // UPDATE
router.get(
  "/avalider/:id",
  authmiddleware.authentificatetoken,
  controller.getDemandeAvalider,
); // READ
router.get(
  "/validateurs/:id",
  authmiddleware.authentificatetoken,
  controller.getValidateursCircuit,
); // READ
router.get(
  "/detail/budget/:id",
  authmiddleware.authentificatetoken,
  controller.getDetailBudget,
); // READ
router.delete(
  "/delete/:id",
  authmiddleware.authentificatetoken,
  controller.delete,
); // DELETE
//router.post('/duplicate/:id', authmiddleware.authentificatetoken, controller.duplicate) // DUPLICATE

const {
  upload,
  fixmimetype,
} = require("../../../middlewares/upload/pjdemande");
// POUR LES PIÈCES JOINTES

router.post(
  "/:id/demande-pieces-jointes",
  upload.array("files", parseInt(10)),
  fixmimetype,
  controller.uploadFiles,
);

router.get("/:id/demande-pieces-jointes", controller.getFiles);
router.delete(
  "/:id/demande-pieces-jointes/:idpiecejointe",
  controller.deleteFile,
);

module.exports = router;
