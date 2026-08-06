const express = require('express');
const router = express.Router();
const ecriturecontroller = require("../controllers/ecriture.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

//router.get("/Ecriture",authmiddleware.authentificatetoken, ecriturecontroller.getallecritures);
//router.get("/Ecriture/:id",authmiddleware.authentificatetoken, ecriturecontroller.getoneecriture);
router.post("/:idoperation", authmiddleware.authentificatetoken, ecriturecontroller.GenererEcriture);
router.post("/justificatif/:idjustificatif", authmiddleware.authentificatetoken, ecriturecontroller.GenererJustificatif);
router.post("/Ecriture/comptabiliser-unitaire", authmiddleware.authentificatetoken, ecriturecontroller.comptabiliserUnitaire);
router.post("/Ecriture/comptabiliser-masse", authmiddleware.authentificatetoken, ecriturecontroller.comptabiliserMasse);
//router.delete("/Ecriture/:id",authmiddleware.authentificatetoken, ecriturecontroller.deleteecriture);

module.exports = router;