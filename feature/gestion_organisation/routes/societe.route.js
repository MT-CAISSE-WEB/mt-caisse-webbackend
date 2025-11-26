const express = require('express');
const router = express.Router();
const societecontroller = require("../controllers/societe.controller");

router.get("/Societe", societecontroller.getallsocietes);
router.get("/Societe/:id", societecontroller.getonesociete);
router.post("/Societe", societecontroller.upsertsociete);
router.delete("/Societe/:id", societecontroller.deletesociete);

module.exports = router;
