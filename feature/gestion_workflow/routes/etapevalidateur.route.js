const express = require('express');
const router = express.Router();
const etapevalidateur_controller = require("../controllers/etapevalidateur.controller");


// CRUD nature operation
router.get("/", etapevalidateur_controller.get_etapevalidateur);
router.get("/:id", etapevalidateur_controller.get_oneetapevalidateur);
router.post("/create", etapevalidateur_controller.create_etapevalidateur);
router.put("/update/:idcircuitetape/:idutilisateur",etapevalidateur_controller.update_etapevalidateur);
router.delete("/delete/:idcircuitetape/:idutilisateur", etapevalidateur_controller.delete_etapevalidateur);

module.exports = router;