const express = require('express');
const router = express.Router();
const rolecontroller = require("../controllers/role.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/Role",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'),rolecontroller.getallroles);
router.get("/Role/:id",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'), rolecontroller.getonerole);
router.post("/Role",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'), rolecontroller.upsertrole);
router.delete("/Role/:id",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'), rolecontroller.deleterole);

module.exports = router;