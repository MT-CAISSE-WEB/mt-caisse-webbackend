const express = require('express');
const router = express.Router();
const validationdemande_controller = require("../controllers/validationdemande.controller");
//const auth = require("../shared/middlewares/auth");


// CRUD nature operation
router.get("/", validationdemande_controller.get_validationdemandes);
router.get("/:id", validationdemande_controller.get_onevalidationdemande);
router.post("/create", validationdemande_controller.create_validationdemande);
router.put("/update/:id", validationdemande_controller.update_validationdemande);
router.delete("/delete/:id", validationdemande_controller.delete_validationdemande);

module.exports = router;
