const express = require('express');
const router = express.Router();
const operation_controller = require("../controllers/operation.controller");
const enteteoperation_controller = require("../controllers/enteteoperation.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

// CRUD OPERATION
router.get("/", authmiddleware.authentificatetoken, operation_controller.get_typeoperations);
router.get("/:id", authmiddleware.authentificatetoken, operation_controller.get_onetypeoperation);
router.get("/caisse/solde", authmiddleware.authentificatetoken, operation_controller.get_soldecaisse);
router.get("/paiement/max", authmiddleware.authentificatetoken, operation_controller.get_operationmax);
router.post("/create/", authmiddleware.authentificatetoken, operation_controller.create_typeoperation);
router.put("/update/:id", authmiddleware.authentificatetoken, operation_controller.update_typeoperation);
router.delete("/delete/:id", authmiddleware.authentificatetoken, operation_controller.delete_typeoperation);
router.get('/recu-caisse/:id', authmiddleware.authentificatetoken, operation_controller.get_recudecaisse);
router.post("/cancel/", authmiddleware.authentificatetoken, operation_controller.cancel_enteteoperation);

// Route pour récupérer les données d'un reçu
router.get('/data/:numero', operation_controller.getRecuData);

module.exports = router;