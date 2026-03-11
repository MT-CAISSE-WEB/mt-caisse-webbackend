const express = require("express");
const router = express.Router();

const statsDmdController = require("../controllers/statsDemandeParStatut.controller");

/**
 * GET : Nombre de natures par département
 */
router.get("/demandes-statuts", statsDmdController.getDemandesParStatut);

module.exports = router;
