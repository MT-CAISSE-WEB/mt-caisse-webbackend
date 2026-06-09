const express = require('express');
const router = express.Router();
const ecriturecontroller = require("../controllers/ecriture.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

//router.get("/Ecriture",authmiddleware.authentificatetoken, ecriturecontroller.getallecritures);
//router.get("/Ecriture/:id",authmiddleware.authentificatetoken, ecriturecontroller.getoneecriture);
router.post("/:idoperation", ecriturecontroller.GenererEcriture);
router.post("/justificatif/:idjustificatif",ecriturecontroller.GenererJustificatif);
router.post("/Ecriture/comptabiliser-unitaire", ecriturecontroller.comptabiliserUnitaire);
router.post("/Ecriture/comptabiliser-masse", ecriturecontroller.comptabiliserMasse);
//router.delete("/Ecriture/:id",authmiddleware.authentificatetoken, ecriturecontroller.deleteecriture);

module.exports = router;