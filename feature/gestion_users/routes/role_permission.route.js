const express = require('express');
const router = express.Router();
const rolepermissioncontroller = require("../controllers/role_permission.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/Rolepermission",authmiddleware.authentificatetoken,rolepermissioncontroller.getallrolepermissions);
router.get("/Rolepermission/:id/permissions",authmiddleware.authentificatetoken,rolepermissioncontroller.getpermissionsbyrole);
router.get("/Rolepermission/:id",authmiddleware.authentificatetoken, rolepermissioncontroller.getonerolepermission);
router.post("/Rolepermission",authmiddleware.authentificatetoken, rolepermissioncontroller.upsertrolepermission);
router.delete("/Rolepermission/:idrole/permissions/:idpermission",authmiddleware.authentificatetoken, rolepermissioncontroller.deleterolepermission);

module.exports = router;
