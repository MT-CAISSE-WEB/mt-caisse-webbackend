const express = require('express');
const router = express.Router();
const permissioncontroller = require("../controllers/permission.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/Permission",authmiddleware.authentificatetoken,permissioncontroller.getallpermission);
router.get("/Permission/:id",authmiddleware.authentificatetoken, permissioncontroller.getonepermission);
router.post("/Permission",authmiddleware.authentificatetoken, permissioncontroller.upsertpermission);
router.delete("/Permission/:id",authmiddleware.authentificatetoken, permissioncontroller.deletepermission);

module.exports = router;