const express = require('express');
const router = express.Router();
const utilisateurcaisse_controller = require("../controllers/utilisateurcaisse.controller");
//const auth = require("../shared/middlewares/auth");

// CRUD UTILISATEUR CAISSE
router.get("/", utilisateurcaisse_controller.get_utilisateurcaisses);
router.get("/:id", utilisateurcaisse_controller.get_oneutilisateurcaisse);
router.post("/create/", utilisateurcaisse_controller.create_utilisateurcaisse);
router.put("/update/:id", utilisateurcaisse_controller.update_utilisateurcaisse);
router.delete("/delete/:id", utilisateurcaisse_controller.delete_utilisateurcaisse);

module.exports = router;