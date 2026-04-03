const express = require('express');
const router = express.Router();
const rolecontroller = require("../controllers/role.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/Role",authmiddleware.authentificatetoken,rolecontroller.getallroles);
router.get("/Role/:id",authmiddleware.authentificatetoken, rolecontroller.getonerole);
router.post("/Role",authmiddleware.authentificatetoken, rolecontroller.upsertrole);
router.delete("/Role/:id",authmiddleware.authentificatetoken, rolecontroller.deleterole);

module.exports = router;