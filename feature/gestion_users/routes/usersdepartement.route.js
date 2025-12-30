const express = require('express');
const router = express.Router();
const utilisateurdeptcontroller = require("../controllers/usersdepartement.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

// authmiddleware.authentificatetoken

router.get("/Utilisateurdepartement",utilisateurdeptcontroller.getallutilisateurdept);
router.get("/Utilisateurdepartement/:id/departements",utilisateurdeptcontroller.getutilisateurdept);
router.post("/Utilisateurdepartement", utilisateurdeptcontroller.upsertutilisateurdept);
router.delete("/Utilisateurdepartement/:idutilisateur/departement/:iddepartement", utilisateurdeptcontroller.deleteutilisateurdept);

module.exports = router;