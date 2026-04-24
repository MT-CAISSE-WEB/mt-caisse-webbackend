const express = require('express');
const router = express.Router();
const opconsultation_controller = require("../../consultations/controllers/operationConsultation.controller");
const jouconsultation_controller = require("../../consultations/controllers/editionjournalcaisse.controller");


router.post("/journalpaiement", opconsultation_controller.journalPaiementController); // OK
router.post("/detailoperation", opconsultation_controller.detailOperationController); // OK
router.post("/journalcaisse", jouconsultation_controller.get_journalcaisse); // OK
router.post("/lastoperation", opconsultation_controller.getLastOpController); // OK
router.post("/historyoperation", opconsultation_controller.historyController); // OK
router.get("/allpayment", opconsultation_controller.getAllpayment); // OK
router.post("/cloture/caisse", opconsultation_controller.etatclotureController); // OK
router.post("/etat/cloture/pdf", jouconsultation_controller.get_journalcaisse); // OK

module.exports = router;