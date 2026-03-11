const express = require("express");
const router = express.Router();

const statsController = require("../controllers/statsNatureByDept.controller");

/**
 * GET : Nombre de natures par département
 */
router.get(
  "/departements/natures/count",
  statsController.getTauxConsommationNatureByDepartement,
);

module.exports = router;
