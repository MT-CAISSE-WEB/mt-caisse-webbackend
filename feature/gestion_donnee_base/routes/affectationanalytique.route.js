const express = require('express');
const router = express.Router();
const affectation_controller = require("../controllers/affectationanalytique.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");
// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

// CRUD nature operation
router.get("/", authmiddleware.authentificatetoken, affectation_controller.get_allaffectations); // OK
router.get("/:idaffectation", authmiddleware.authentificatetoken, affectation_controller.get_oneaffectation); // OK
router.post("/create/", authmiddleware.authentificatetoken, affectation_controller.create_affectation); // OK
router.put("/update/:idaffectation", authmiddleware.authentificatetoken, affectation_controller.update_affectation); // OK
router.delete("/delete/:idaffectation", authmiddleware.authentificatetoken, affectation_controller.delete_affectation); // OK

module.exports = router;
