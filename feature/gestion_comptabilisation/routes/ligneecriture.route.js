const express = require('express');
const router = express.Router();
const ligneecriturecontroller = require("../controllers/ligneecriture.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.post("/Ecriture/LigneEcriture/comptabilisationdefinitive",ligneecriturecontroller.comptabilisationEcriture);
router.post("/Ecriture/LigneEcriture",ligneecriturecontroller.getallLigneEcriture);
//router.get("/Ecriture/:id",authmiddleware.authentificatetoken, ecriturecontroller.getoneecriture);

module.exports = router;