const express = require('express');
const router = express.Router();
const ligneecriturecontroller = require("../controllers/ligneecriture.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

//router.get("/Ecriture/LigneEcriture",authmiddleware.authentificatetoken, ligneecriturecontroller.getallLigneEcriture);
router.get("/Ecriture/LigneEcriture",ligneecriturecontroller.getallLigneEcriture);
//router.get("/Ecriture/:id",authmiddleware.authentificatetoken, ecriturecontroller.getoneecriture);

module.exports = router;