const express = require('express');
const router = express.Router();
const tauxdevisecontroller = require("../controllers/tauxdevise.controller");

router.get("/Tauxdevise", tauxdevisecontroller.getalltauxdevises);
router.get("/Tauxdevise/:id", tauxdevisecontroller.getonetauxdevise);
router.post("/Tauxdevise",tauxdevisecontroller.upserttauxdevise );
router.delete("/Tauxdevise/:id",tauxdevisecontroller.deletetauxdevise);

module.exports = router;