const express = require('express');
const router = express.Router();
const opconsultation_controller = require("../../consultations/controllers/operationConsultation.controller");


router.post("/journalpaiement", opconsultation_controller.journalPaiementController); // OK
router.post("/detailoperation", opconsultation_controller.detailOperationController); // OK

module.exports = router;