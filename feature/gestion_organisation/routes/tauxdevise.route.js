const express = require('express');
const router = express.Router();
const tauxdevisecontroller = require("../controllers/tauxdevise.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/Tauxdevise",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'), tauxdevisecontroller.getalltauxdevises);
router.get("/Tauxdevise/devises",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'), tauxdevisecontroller.getalldevisesactif);
router.get("/Tauxdevise/:id",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'), tauxdevisecontroller.getonetauxdevise);
router.post("/Tauxdevise",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'), tauxdevisecontroller.upserttauxdevise );
router.delete("/Tauxdevise/:id",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'),tauxdevisecontroller.deletetauxdevise);
module.exports = router;