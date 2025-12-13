const express = require('express');
const router = express.Router();
const plancomptable_controller = require("../controllers/plancomptable.controller");
//const auth = require("../shared/middlewares/auth");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

// CRUD nature operation
router.get("/", plancomptable_controller.get_comptes); // OK
router.get("/:idcompte", plancomptable_controller.get_onecompte); // OK
router.post("/create", plancomptable_controller.create_compte); // OK
router.put("/update/:idcompte", plancomptable_controller.update_compte);
router.delete("/delete/:idcompte", plancomptable_controller.delete_compte);

module.exports = router;
