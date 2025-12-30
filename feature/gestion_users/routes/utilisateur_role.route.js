const express = require('express');
const router = express.Router();
const utilisateur_rolecontroller = require("../controllers/utilisateur_role.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

// authmiddleware.authentificatetoken, 

router.get("/Utilisateur_role",utilisateur_rolecontroller.getallutilisateurrole);
router.get("/Utilisateur_role/:id/roles",utilisateur_rolecontroller.getutilisateursroles);
router.post("/Utilisateur_role", utilisateur_rolecontroller.upsertutilisateurrole);
router.delete("/Utilisateur_role/:idutilisateur/roles/:idrole", utilisateur_rolecontroller.deleteutilisateurrole);

module.exports = router;