const express = require('express');
const router = express.Router();
const ligneoperation_controller = require("../controllers/ligneoperation.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

// CRUD LIGNE OPERATION
router.get("/", authmiddleware.authentificatetoken, ligneoperation_controller.get_ligneoperations);
router.get("/:id", authmiddleware.authentificatetoken, authmiddleware.authentificatetoken, ligneoperation_controller.get_oneligneoperation);
router.post("/create/", authmiddleware.authentificatetoken, ligneoperation_controller.create_ligneoperation);
router.put("/update/:id", authmiddleware.authentificatetoken, ligneoperation_controller.update_ligneoperation);
router.delete("/delete/:id", authmiddleware.authentificatetoken, ligneoperation_controller.delete_ligneoperation);

module.exports = router;