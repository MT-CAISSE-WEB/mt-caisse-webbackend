const express = require('express');
const router = express.Router();
const affectation_controller = require("../controllers/affectationnaturecentre.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

// CRUD nature operation
router.get("/:idnature", authmiddleware.authentificatetoken, affectation_controller.getallCentres); // OK
router.post("/:idnature", authmiddleware.authentificatetoken, affectation_controller.saveAffectations); // OK

module.exports = router;
