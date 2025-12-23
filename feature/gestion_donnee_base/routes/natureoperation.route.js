const express = require('express');
const router = express.Router();
const natureoperation_controller = require("../controllers/natureoperation.controller");
//const auth = require("../shared/middlewares/auth");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

// CRUD nature operation
router.get("/", natureoperation_controller.get_natures); // OK
router.get("/:idnature", natureoperation_controller.get_onenature); // OK
router.post("/create/", natureoperation_controller.create_nature); // OK
router.put("/update/:idnature", natureoperation_controller.update_nature);
router.delete("/delete/:idnature", natureoperation_controller.delete_nature);

module.exports = router;
