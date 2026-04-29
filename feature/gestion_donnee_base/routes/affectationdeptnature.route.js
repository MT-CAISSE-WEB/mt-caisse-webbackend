const express = require('express');
const router = express.Router();
const affectation_controller = require("../controllers/affectationdeptnature.controller");
const multer = require('multer');
// config multer
const upload = multer({ dest: 'uploads/' });
//const auth = require("../shared/middlewares/auth");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

router.get("/:iddepartement", affectation_controller.getAllNatures); // OK
router.post("/:iddepartement", affectation_controller.saveAffectations); // OK
router.post("/export/departement", affectation_controller.exportAffDepartements); // OK
router.post("/import/departement", upload.single('file'), affectation_controller.import_affectations); // OK

module.exports = router;
