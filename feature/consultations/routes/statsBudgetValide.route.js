const express = require("express");
const router = express.Router();
const statsvalidatedBudgetController = require("../controllers/statsBudgetvalide.controller");

router.get(
  "/budget-valide",
  statsvalidatedBudgetController.getBudgetAnnuelEnCours,
);

module.exports = router;
