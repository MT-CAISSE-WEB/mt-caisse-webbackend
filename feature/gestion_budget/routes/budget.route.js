const express = require("express");
const router = express.Router();
const controller = require("../controllers/budget.controller");
const circuitValidateurcontroller = require("../services/budget.service");

router.get("/budgetpj-download", controller.downloadFile);

router.post("/create", controller.create); // CREATE
router.get("/", controller.getAll); // READ ALL
router.get("/:id", controller.getById); // READ ONE BY ID
router.patch("/update/:id", controller.update); // UPDATE
router.delete("/delete/:id", controller.delete); // DELETE
router.post("/duplicate/:id", controller.duplicate); // DUPLICATE

router.get(
  "/validateurs/:id",
  circuitValidateurcontroller.get_validateurBudget,
); // READ VALIDATEURS
router.post("/validate/:id", circuitValidateurcontroller.validerBudget); // UPDATE

// Budgets annuels et ses budgets mensuels
router.get("/mensuels/budgets-annuels", controller.getAnnualBudgetsWithMonthly);

const { upload, fixmimetype } = require("../../../middlewares/upload/pjbudget");
// POUR LES PIÈCES JOINTES
router.post(
  "/:id/budget-pieces-jointes",
  upload.array("files", parseInt(10)),
  fixmimetype,
  controller.uploadFiles,
);

router.get("/:id/budget-pieces-jointes", controller.getFiles);
router.delete(
  "/:id/budget-pieces-jointes/:idpiecejointe",
  controller.deleteFile,
);

module.exports = router;
