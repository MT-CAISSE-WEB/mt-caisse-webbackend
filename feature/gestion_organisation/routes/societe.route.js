const express = require('express');
const router = express.Router();
const societecontroller = require("../controllers/societe.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");
const uploadLogo = require('../../../middlewares/uploadlogo');

router.get("/Societe",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('Caissier','Admin'), societecontroller.getallsocietes);
router.get("/Societe/devises",authmiddleware.authentificatetoken, societecontroller.getalldevises);
router.get("/Societe/:id",authmiddleware.authentificatetoken, societecontroller.getonesociete);
router.post("/Societe",authmiddleware.authentificatetoken, uploadLogo.single('logo'), societecontroller.upsertsociete);
router.delete("/Societe/:id",authmiddleware.authentificatetoken, societecontroller.deletesociete);

module.exports = router;
