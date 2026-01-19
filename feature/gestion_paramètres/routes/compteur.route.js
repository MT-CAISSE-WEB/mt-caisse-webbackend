const express = require('express');
const router = express.Router();
const compteur_controller = require("../controllers/compteur.controller");

// CRUD compteur
router.get("/", compteur_controller.get_compteurs);
router.get("/:id", compteur_controller.get_onecompteur);
router.post("/create/", compteur_controller.createcompteur);
router.put("/update/:id", compteur_controller.update_compteur);
router.delete("/delete/:id", compteur_controller.delete_compteur);

module.exports = router;