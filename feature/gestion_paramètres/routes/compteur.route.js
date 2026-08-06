const express = require('express');
const router = express.Router();
const compteur_controller = require("../controllers/compteur.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

// CRUD compteur
router.get("/", authmiddleware.authentificatetoken, compteur_controller.get_compteurs);
router.get("/:id", authmiddleware.authentificatetoken, compteur_controller.get_onecompteur);
router.post("/create/", authmiddleware.authentificatetoken, compteur_controller.createcompteur);
router.put("/update/:id", authmiddleware.authentificatetoken, compteur_controller.update_compteur);
router.delete("/delete/:id", authmiddleware.authentificatetoken, compteur_controller.delete_compteur);

module.exports = router;