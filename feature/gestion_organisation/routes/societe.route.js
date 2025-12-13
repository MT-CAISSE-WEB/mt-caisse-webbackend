const express = require('express');
const router = express.Router();
<<<<<<< HEAD
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
=======
const societecontroller = require("../controllers/societe.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");
const uploadLogo = require('../../../middlewares/uploadlogo');

router.get("/Societe",authmiddleware.authentificatetoken, societecontroller.getallsocietes);
router.get("/Societe/devises",authmiddleware.authentificatetoken, societecontroller.getalldevises);
router.get("/Societe/:id",authmiddleware.authentificatetoken, societecontroller.getonesociete);
router.post("/Societe",authmiddleware.authentificatetoken, uploadLogo.single('logo'), societecontroller.upsertsociete);
router.delete("/Societe/:id",authmiddleware.authentificatetoken, societecontroller.deletesociete);
>>>>>>> origin/junior

module.exports = router;
