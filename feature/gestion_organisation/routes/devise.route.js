const express = require('express');
const router = express.Router();
const devisecontroller = require("../controllers/devise.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/Devise",authmiddleware.authentificatetoken, devisecontroller.getalldevises);
router.get("/Devise/:id",authmiddleware.authentificatetoken, devisecontroller.getonedevise);
router.post("/Devise",authmiddleware.authentificatetoken, devisecontroller.upsertdevise);
router.delete("/Devise/:id",authmiddleware.authentificatetoken, devisecontroller.deletedevise);

module.exports = router;
