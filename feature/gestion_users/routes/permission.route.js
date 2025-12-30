const express = require('express');
const router = express.Router();
const permissioncontroller = require("../controllers/permission.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/Permission",permissioncontroller.getallpermission);
router.get("/Permission/:id", permissioncontroller.getonepermission);
router.post("/Permission", permissioncontroller.upsertpermission);
router.delete("/Permission/:id", permissioncontroller.deletepermission);

module.exports = router;