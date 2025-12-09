const express = require('express');
const router = express.Router();
const departementcontroller = require("../controllers/departement.controller");

router.get("/Departement", departementcontroller.getalldepartement);
router.get("/Departement/:id", departementcontroller.getonedepartement);
router.post("/Departement",departementcontroller.upsertdepartement);
router.delete("/Departement/:id", departementcontroller.deletedepartement);

module.exports = router;
