const express = require('express');
const router = express.Router();
const affectation_controller = require("../controllers/affectationdeptnature.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

router.get("/:iddepartement", authmiddleware.authentificatetoken, affectation_controller.getAllNatures); // OK
router.post("/:iddepartement", authmiddleware.authentificatetoken, affectation_controller.saveAffectations); // OK
router.post("/export", authmiddleware.authentificatetoken, affectation_controller.exportAffDepartements); // OK

module.exports = router;
