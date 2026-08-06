const express = require("express");
const router = express.Router();
const UserController = require("../controllers/utilisateur_import.controller");
const { uploadMiddleware } = require("../utils/upload.middleware");
// Routes d'import/export (routes statiques)
router.get("/User/export", UserController.exportUsers);
router.get("/User/template", UserController.getImportTemplate);
router.get("/User/template/download", UserController.downloadTemplate);

router.post(
  "/User/import/preview",
  uploadMiddleware.single("file"),
  UserController.previewImport,
);

router.post(
  "/User/import",
  uploadMiddleware.single("file"),
  UserController.importUsers,
);

module.exports = router;
