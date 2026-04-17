const express = require('express');
const router = express.Router();
const parametreController = require("../controllers/parametrecomptable.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

// CRUD motif
//router.get("/", motif_controller.get_motifs);
router.post("/getall/", authmiddleware.authentificatetoken, parametreController.getParametreComptable);
router.post("/save", authmiddleware.authentificatetoken,  parametreController.saveParametreComptable);

module.exports = router;