const express = require('express');
const router = express.Router();
const consultation_decaissAj = require("../../consultations/controllers/decaissementAj.controller");

router.post("/decaissement_justificatif", consultation_decaissAj.decaissementAjConsultation); // OK
//router.post("/demande_detail", consultation_decaissAj.demandeConsultation); //
//router.post("/demandes/user", consultation_decaissAj.demandeConsultationByUser); //

module.exports = router;
