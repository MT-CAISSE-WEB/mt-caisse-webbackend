const express = require('express');
const router = express.Router();
const affectation_controller = require("../controllers/affectationnaturecentre.controller");
//const auth = require("../shared/middlewares/auth");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

// CRUD nature operation
router.get("/:idnature", affectation_controller.getCentresNonAffectes); // OK
router.get("/:idnature", affectation_controller.getCentresAffectees); // OK
module.exports = router;
