const express = require('express');
const router = express.Router();
const affectation_controller = require("../controllers/affectationanalytique.controller");
//const auth = require("../shared/middlewares/auth");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

// CRUD nature operation
router.get("/", affectation_controller.get_allaffectations); // OK
router.get("/:idaffectation", affectation_controller.get_oneaffectation); // OK
router.post("/create/", affectation_controller.create_affectation); // OK
router.put("/update/:idaffectation", affectation_controller.update_affectation); // OK
router.delete("/delete/:idaffectation", affectation_controller.delete_affectation); // OK

module.exports = router;
