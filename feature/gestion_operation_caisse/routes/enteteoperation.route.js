const express = require('express');
const router = express.Router();
const enteteoperation_controller = require("../controllers/enteteoperation.controller");
const operation_controller = require("../controllers/operation.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

// CRUD ENTETE OPERATION
router.get("/", authmiddleware.authentificatetoken, enteteoperation_controller.get_enteteoperations);
router.get("/:id", authmiddleware.authentificatetoken, enteteoperation_controller.get_oneenteteoperation);
router.get("/caisse/solde", authmiddleware.authentificatetoken, operation_controller.get_soldecaisse);
router.post("/create/", authmiddleware.authentificatetoken, enteteoperation_controller.create_enteteoperation);
router.put("/update/:id", authmiddleware.authentificatetoken, enteteoperation_controller.update_enteteoperation);
router.delete("/delete/:id", authmiddleware.authentificatetoken, enteteoperation_controller.delete_enteteoperation);

module.exports = router;