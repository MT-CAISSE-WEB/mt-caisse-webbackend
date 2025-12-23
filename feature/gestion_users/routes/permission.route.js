const express = require('express');
const router = express.Router();
const permissioncontroller = require("../controllers/permission.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/Permission",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'),permissioncontroller.getallpermission);
router.get("/Permission/:id",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'), permissioncontroller.getonepermission);
router.post("/Permission",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'), permissioncontroller.upsertpermission);
router.delete("/Permission/:id",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'), permissioncontroller.deletepermission);

module.exports = router;