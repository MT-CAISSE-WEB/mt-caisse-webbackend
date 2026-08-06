const express = require('express');
const router = express.Router();
const opconsultation_controller = require("../../consultations/controllers/operationConsultation.controller");
const jouconsultation_controller = require("../../consultations/controllers/editionjournalcaisse.controller");
const periodecaisse_controller = require("../../gestion_operation_caisse/controllers/caisseperiode.controller")
const authmiddleware = require("../../../middlewares/auth.middlewre");


router.post("/journalpaiement", authmiddleware.authentificatetoken, opconsultation_controller.journalPaiementController); // OK
router.post("/detailoperation", authmiddleware.authentificatetoken, opconsultation_controller.detailOperationController); // OK
router.post("/journalcaisse", authmiddleware.authentificatetoken, jouconsultation_controller.get_journalcaisse); // OK
router.post("/lastoperation", authmiddleware.authentificatetoken, opconsultation_controller.getLastOpController); // OK
router.post("/historyoperation", authmiddleware.authentificatetoken, opconsultation_controller.historyController); // OK
router.get("/allpayment", authmiddleware.authentificatetoken, opconsultation_controller.getAllpayment); // OK
router.post("/cloture/caisse", authmiddleware.authentificatetoken, opconsultation_controller.etatclotureController); // OK
router.post("/etat/cloture/pdf", authmiddleware.authentificatetoken, jouconsultation_controller.get_journalcaisse); // OK
router.get("/solde/allcaisse", authmiddleware.authentificatetoken, periodecaisse_controller.get_soldeAllcaisses);
router.post("/journalencaissement", authmiddleware.authentificatetoken, opconsultation_controller.journalencaissementcontroller);

module.exports = router;