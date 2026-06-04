const express = require('express');
const router = express.Router();
const utilisateurcaisse_controller = require("../controllers/utilisateurcaisse.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

// CRUD UTILISATEUR CAISSE
router.get("/", authmiddleware.authentificatetoken, utilisateurcaisse_controller.get_utilisateurcaisses);
router.get("/:id", authmiddleware.authentificatetoken, utilisateurcaisse_controller.get_oneutilisateurcaisse);
router.get("/user/:id", authmiddleware.authentificatetoken, utilisateurcaisse_controller.get_caisseByUser);
router.post("/periode/caisse", authmiddleware.authentificatetoken, utilisateurcaisse_controller.get_loadcaisseuser);
router.get("/periode/user/:id", authmiddleware.authentificatetoken, utilisateurcaisse_controller.get_caissePeriodeByUser);
router.post("/create/", authmiddleware.authentificatetoken, utilisateurcaisse_controller.create_utilisateurcaisse);
router.put("/update/:id", authmiddleware.authentificatetoken, utilisateurcaisse_controller.update_utilisateurcaisse);
router.delete("/delete/:id", authmiddleware.authentificatetoken, utilisateurcaisse_controller.delete_utilisateurcaisse);

module.exports = router;