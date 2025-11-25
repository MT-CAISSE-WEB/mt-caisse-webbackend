const express = require('express');
const router = express.Router();
const societe_controller = require("../controllers/societe.controller");
//const auth = require("../shared/middlewares/auth");

// CRUD nature operation
router.get("/", societe_controller.get_societes);
router.get("/:id", societe_controller.get_onesociete);
router.post("/create/", societe_controller.create_societe);
router.put("/update/:id", societe_controller.update_societe);
router.delete("/delete/:id", societe_controller.delete_societe);

module.exports = router;
