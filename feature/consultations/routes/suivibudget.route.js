const express = require('express');
const router = express.Router();
const suivibudget_controller = require("../../consultations/controllers/suivibudget.controller");
//const auth = require("../shared/middlewares/auth");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

router.get("/", suivibudget_controller.suivibudgetController); // OK
router.post("/recherche", suivibudget_controller.suiviByFiltreController); // OK

module.exports = router;