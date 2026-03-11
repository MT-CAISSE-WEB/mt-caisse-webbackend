const express = require("express");
const router = express.Router();

const statsMontantByDeptController = require("../controllers/montantByDepartement.controller");

/**
 * GET : Nombre de natures par département
 */
router.get(
  "/montant-by-departement",
  statsMontantByDeptController.getMontantParDepartement,
);

module.exports = router;
