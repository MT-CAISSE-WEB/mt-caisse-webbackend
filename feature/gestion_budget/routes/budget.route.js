const express = require("express");
const router = express.Router();
const controller = require("../controllers/budget.controller");
const circuitValidateurcontroller = require("../services/budget.service");
const { upload, fixmimetype } = require("../../../middlewares/upload/pjbudget");
const authmiddleware = require("../../../middlewares/auth.middlewre");

// ============================================
// 1️⃣ ROUTES STATIQUES (SANS PARAMÈTRES)
// ============================================
router.get(
  "/budgetpj-download",
  authmiddleware.authentificatetoken,
  controller.downloadFile,
);
router.get(
  "/mensuels/budgets-annuels",
  authmiddleware.authentificatetoken,
  controller.getAnnualBudgetsWithMonthly,
);

// ============================================
// 2️⃣ ROUTES POUR PIÈCES JOINTES (AVEC PARAMÈTRES SPÉCIFIQUES)
// ============================================
// ⭐ IMPORTANT : Placer ces routes AVANT la route /:id
router.get(
  "/:id/budget-pieces-jointes/download-all",
  authmiddleware.authentificatetoken,
  controller.downloadAllFiles,
);
router.get(
  "/:id/budget-pieces-jointes",
  authmiddleware.authentificatetoken,
  controller.getFiles,
);
router.post(
  "/:id/budget-pieces-jointes",
  authmiddleware.authentificatetoken,
  upload.array("files", parseInt(10)),
  fixmimetype,
  controller.uploadFiles,
);
router.delete(
  "/:id/budget-pieces-jointes/:idpiecejointe",
  authmiddleware.authentificatetoken,
  controller.deleteFile,
);

// ============================================
// 3️⃣ ROUTES CRUD (AVEC PARAMÈTRE :id)
// ============================================
router.post("/create", authmiddleware.authentificatetoken, controller.create);
router.get("/", authmiddleware.authentificatetoken, controller.getAll);
router.get("/:id", authmiddleware.authentificatetoken, controller.getById);
router.patch(
  "/update/:id",
  authmiddleware.authentificatetoken,
  controller.update,
);
router.delete(
  "/delete/:id",
  authmiddleware.authentificatetoken,
  controller.delete,
);
router.post(
  "/duplicate/:id",
  authmiddleware.authentificatetoken,
  controller.duplicate,
);

// ============================================
// 4️⃣ ROUTES DE VALIDATION
// ============================================
router.get(
  "/validateurs/:id",
  authmiddleware.authentificatetoken,
  circuitValidateurcontroller.get_validateurBudget,
);
router.post(
  "/validate/:id",
  authmiddleware.authentificatetoken,
  circuitValidateurcontroller.validerBudget,
);

module.exports = router;
