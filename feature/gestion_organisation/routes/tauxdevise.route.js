const express = require('express');
const router = express.Router();
const tauxdevisecontroller = require("../controllers/tauxdevise.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/Tauxdevise",authmiddleware.authentificatetoken,tauxdevisecontroller.getalltauxdevises);
router.get("/Tauxdevise/devises",authmiddleware.authentificatetoken, tauxdevisecontroller.getalldevisesactif);
router.get("/Tauxdevise/:id",authmiddleware.authentificatetoken, tauxdevisecontroller.getonetauxdevise);
router.post("/Tauxdevise",authmiddleware.authentificatetoken, tauxdevisecontroller.upserttauxdevise );
router.delete("/Tauxdevise/:id",authmiddleware.authentificatetoken, tauxdevisecontroller.deletetauxdevise);
module.exports = router;