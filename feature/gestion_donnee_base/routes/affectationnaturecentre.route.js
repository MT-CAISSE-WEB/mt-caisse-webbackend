const express = require('express');
const router = express.Router();
const affectation_controller = require("../controllers/affectationnaturecentre.controller");
const multer = require('multer');
// config multer
const upload = multer({ dest: 'uploads/' });
//const auth = require("../shared/middlewares/auth");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

// CRUD nature operation
router.get("/:idnature", affectation_controller.getallCentres); // OK
router.post("/:idnature", affectation_controller.saveAffectations); // OK
router.post("/export/nature", affectation_controller.exportAffCentres); // OK
router.post('/import/nature', upload.single('file'), affectation_controller.import_affectations); // OK



module.exports = router;
