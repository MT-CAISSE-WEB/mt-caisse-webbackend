const express = require('express');
const router = express.Router();
const consultation_decaissAj = require("../../consultations/controllers/decaissementAj.controller");

router.post("/decaissement_justificatif", consultation_decaissAj.decaissementAjConsultation); // OK

module.exports = router;
