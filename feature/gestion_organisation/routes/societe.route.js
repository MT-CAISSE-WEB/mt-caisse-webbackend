const express = require('express');
const router = express.Router();
const societecontroller = require("../controllers/societe.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");
const uploadLogo = require('../../../middlewares/uploadlogo');

router.get("/Societe", societecontroller.getallsocietes);
router.get("/Societe/devises", societecontroller.getalldevises);
router.get("/Societe/:id", societecontroller.getonesociete);
router.post("/Societe", societecontroller.upsertsociete);
router.delete("/Societe/:id", societecontroller.deletesociete);

module.exports = router;
