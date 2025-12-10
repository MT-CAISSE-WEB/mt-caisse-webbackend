const express = require('express');
const router = express.Router();
const ligneoperation_controller = require("../controllers/ligneoperation.controller");
//const auth = require("../shared/middlewares/auth");

// CRUD LIGNE OPERATION
router.get("/", ligneoperation_controller.get_ligneoperations);
router.get("/:id", ligneoperation_controller.get_oneligneoperation);
router.post("/create/", ligneoperation_controller.create_ligneoperation);
router.put("/update/:id", ligneoperation_controller.update_ligneoperation);
router.delete("/delete/:id", ligneoperation_controller.delete_ligneoperation);

module.exports = router;