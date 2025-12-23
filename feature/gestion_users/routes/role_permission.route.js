const express = require('express');
const router = express.Router();
const rolepermissioncontroller = require("../controllers/role_permission.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/Rolepermission",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'),rolepermissioncontroller.getallrolepermissions);
router.get("/Rolepermission/:id/permissions",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'),rolepermissioncontroller.getpermissionsbyrole);
router.get("/Rolepermission/:id",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'), rolepermissioncontroller.getonerolepermission);
router.post("/Rolepermission",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'), rolepermissioncontroller.upsertrolepermission);
router.delete("/Rolepermission/:idrole/permissions/:idpermission",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'), rolepermissioncontroller.deleterolepermission);

module.exports = router;
