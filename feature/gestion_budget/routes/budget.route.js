const express = require("express");
const router = express.Router();
const controller = require("../controllers/budget.controller");
const circuitValidateurcontroller = require("../services/budget.service");
const { upload, fixmimetype } = require("../../../middlewares/upload/pjbudget");

// ============================================
// 1️⃣ ROUTES STATIQUES (SANS PARAMÈTRES)
// ============================================
router.get("/budgetpj-download", controller.downloadFile);
router.get("/mensuels/budgets-annuels", controller.getAnnualBudgetsWithMonthly);

// ============================================
// 2️⃣ ROUTES POUR PIÈCES JOINTES (AVEC PARAMÈTRES SPÉCIFIQUES)
// ============================================
// ⭐ IMPORTANT : Placer ces routes AVANT la route /:id
router.get(
  "/:id/budget-pieces-jointes/download-all",
  controller.downloadAllFiles,
);
router.get("/:id/budget-pieces-jointes", controller.getFiles);
router.post(
  "/:id/budget-pieces-jointes",
  upload.array("files", parseInt(10)),
  fixmimetype,
  controller.uploadFiles,
);
router.delete(
  "/:id/budget-pieces-jointes/:idpiecejointe",
  controller.deleteFile,
);

// ============================================
// 3️⃣ ROUTES CRUD (AVEC PARAMÈTRE :id)
// ============================================
router.post("/create", controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.patch("/update/:id", controller.update);
router.delete("/delete/:id", controller.delete);
router.post("/duplicate/:id", controller.duplicate);

// ============================================
// 4️⃣ ROUTES DE VALIDATION
// ============================================
router.get(
  "/validateurs/:id",
  circuitValidateurcontroller.get_validateurBudget,
);
router.post("/validate/:id", circuitValidateurcontroller.validerBudget);

module.exports = router;