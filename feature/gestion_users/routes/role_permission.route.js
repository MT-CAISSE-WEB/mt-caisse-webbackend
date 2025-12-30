const express = require('express');
const router = express.Router();
const rolepermissioncontroller = require("../controllers/role_permission.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

// authmiddleware.authentificatetoken

router.get("/Rolepermission",rolepermissioncontroller.getallrolepermissions);
router.get("/Rolepermission/:id/permissions",rolepermissioncontroller.getpermissionsbyrole);
router.get("/Rolepermission/:id", rolepermissioncontroller.getonerolepermission);
router.post("/Rolepermission", rolepermissioncontroller.upsertrolepermission);
router.delete("/Rolepermission/:idrole/permissions/:idpermission", rolepermissioncontroller.deleterolepermission);

module.exports = router;
