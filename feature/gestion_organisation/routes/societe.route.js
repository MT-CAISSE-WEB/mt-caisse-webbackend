const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const societecontroller = require("../controllers/societe.controller");

router.get("/Societe", societecontroller.getallsocietes);
router.get("/Societe/:id", societecontroller.getonesociete);
router.post("/Societe", societecontroller.upsertsociete);
router.delete("/Societe/:id", societecontroller.deletesociete);
=======
const societe_controller = require("../controllers/societe.controller");
//const auth = require("../shared/middlewares/auth");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

// CRUD nature operation
router.get("/", societe_controller.get_societes);
router.get("/:id", societe_controller.get_onesociete);
router.post("/create/", societe_controller.create_societe);
router.put("/update/:id", societe_controller.update_societe);
router.delete("/delete/:id", societe_controller.delete_societe);
>>>>>>> origin/ferreol

module.exports = router;
