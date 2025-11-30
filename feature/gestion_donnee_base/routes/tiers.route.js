const express = require('express');
const router = express.Router();
const tiers_controller = require("../controllers/tiers.controller");
//const auth = require("../shared/middlewares/auth");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

// CRUD nature operation
router.get("/", tiers_controller.get_tiers); // OK
router.get("/:idtiers", tiers_controller.get_onetiers); // OK
router.post("/create/", tiers_controller.create_tiers); // OK
router.put("/update/:idtiers", tiers_controller.update_tiers); // OK
router.delete("/delete/:idtiers", tiers_controller.delete_tiers); // OK

module.exports = router;
