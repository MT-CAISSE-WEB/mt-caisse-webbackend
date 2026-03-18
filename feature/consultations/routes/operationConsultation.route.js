const express = require('express');
const router = express.Router();
const opconsultation_controller = require("../../consultations/controllers/operationConsultation.controller");


router.post("/journalpaiement", opconsultation_controller.journalPaiementController); // OK
router.post("/detailoperation", opconsultation_controller.detailOperationController); // OK
router.post("/lastoperation", opconsultation_controller.getLastOpController); // OK
router.post("/historyoperation", opconsultation_controller.historyController); // OK
router.get("/allpayment", opconsultation_controller.getAllpayment); // OK


module.exports = router;