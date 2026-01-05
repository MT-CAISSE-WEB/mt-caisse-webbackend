const express = require('express');
const router = express.Router();
const devisecontroller = require("../controllers/devise.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/Devise", devisecontroller.getalldevises);
router.get("/Devise/:id", devisecontroller.getonedevise);
router.post("/Devise", devisecontroller.upsertdevise);
router.delete("/Devise/:id", devisecontroller.deletedevise);

module.exports = router;