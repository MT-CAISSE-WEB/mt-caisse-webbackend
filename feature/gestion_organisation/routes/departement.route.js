const express = require('express');
const router = express.Router();
const departement_controller = require("../controllers/departement.controller");
//const auth = require("../shared/middlewares/auth");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

// CRUD nature operation
router.get("/", departement_controller.get_departements);
router.get("/:id", departement_controller.get_onedepartement);
router.post("/create/", departement_controller.create_departement);
router.put("/update/:id", departement_controller.update_departement);
router.delete("/delete/:id", departement_controller.delete_departement);

module.exports = router;
