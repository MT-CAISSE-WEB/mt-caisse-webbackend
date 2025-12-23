const express = require('express');
const router = express.Router();
const utilisateurdeptcontroller = require("../controllers/usersdepartement.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/Utilisateurdepartement",authmiddleware.authentificatetoken,utilisateurdeptcontroller.getallutilisateurdept);
router.get("/Utilisateurdepartement/:id/departements",authmiddleware.authentificatetoken,utilisateurdeptcontroller.getutilisateurdept);
router.post("/Utilisateurdepartement",authmiddleware.authentificatetoken, utilisateurdeptcontroller.upsertutilisateurdept);
router.delete("/Utilisateurdepartement/:idutilisateur/departement/:iddepartement",authmiddleware.authentificatetoken, utilisateurdeptcontroller.deleteutilisateurdept);

module.exports = router;