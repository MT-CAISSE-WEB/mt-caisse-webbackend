const express = require('express');
const router = express.Router();
const parametreController = require("../controllers/parametrecomptable.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

// CRUD motif
//router.get("/", motif_controller.get_motifs);
router.post("/getall/", authmiddleware.authentificatetoken, parametreController.getParametreComptable);
router.post("/save", authmiddleware.authentificatetoken,  parametreController.saveParametreComptable);

router.get('/correspondances', authmiddleware.authentificatetoken, parametreController.getAllCorrespondance);
router.get('/correspondances/:id', authmiddleware.authentificatetoken, parametreController.getCorrespondanceById);
router.post('/correspondances', authmiddleware.authentificatetoken, parametreController.createCorrespondance);
router.put('/correspondances/:id', authmiddleware.authentificatetoken, parametreController.updateCorrespondance);
router.delete('/correspondances/:id', authmiddleware.authentificatetoken, parametreController.hardDelete);       // soft delete
// router.delete('/:id/hard', controller.hardDelete); // physique si besoin

router.put('/entite-site', authmiddleware.authentificatetoken, parametreController.saveAnalytiqueEntiteSite);
router.put('/table-correspondance', authmiddleware.authentificatetoken, parametreController.saveAnalytiqueTable);
router.put('/axesecond', authmiddleware.authentificatetoken, parametreController.saveAxeSecond);

module.exports = router;