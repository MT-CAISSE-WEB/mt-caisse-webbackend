const express = require('express');
const router = express.Router();
const affectation_controller = require("../controllers/affectationdeptnature.controller");
//const auth = require("../shared/middlewares/auth");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

router.get("/:iddepartement", affectation_controller.getAllNatures); // OK
router.post("/:iddepartement", affectation_controller.saveAffectations); // OK
router.post("/export", affectation_controller.exportAffDepartements); // OK

module.exports = router;
