const express = require('express');
const router = express.Router();
const rolecontroller = require("../controllers/role.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/Role",rolecontroller.getallroles);
router.get("/Role/:id", rolecontroller.getonerole);
router.post("/Role", rolecontroller.upsertrole);
router.delete("/Role/:id", rolecontroller.deleterole);

module.exports = router;