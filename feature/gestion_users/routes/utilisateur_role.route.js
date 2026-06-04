const express = require('express');
const router = express.Router();
const utilisateur_rolecontroller = require("../controllers/utilisateur_role.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/Utilisateur_role",authmiddleware.authentificatetoken,utilisateur_rolecontroller.getallutilisateurrole);
router.get("/Utilisateur_role/:id/roles",authmiddleware.authentificatetoken,utilisateur_rolecontroller.getutilisateursroles);
router.post("/Utilisateur_role",authmiddleware.authentificatetoken, utilisateur_rolecontroller.upsertutilisateurrole);
router.delete("/Utilisateur_role/:idutilisateur/roles/:idrole",authmiddleware.authentificatetoken, utilisateur_rolecontroller.deleteutilisateurrole);

module.exports = router;