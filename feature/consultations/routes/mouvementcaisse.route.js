const express = require("express");
const router = express.Router();

const statsController = require("../controllers/mouvementcaisse.controller");

// GET /api/stats/caisse-mensuelle?idsociete=xxx&idsite=xxx
router.get("/caisse-mensuelle", statsController.getStatsCaisseMensuelle);

module.exports = router;
