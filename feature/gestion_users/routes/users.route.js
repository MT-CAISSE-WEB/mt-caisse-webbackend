const express = require('express');
const router = express.Router();
const usercontroller = require("../controllers/users.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/User",usercontroller.getallusers);
router.get("/User/:id", usercontroller.getoneuser);
router.post("/User", usercontroller.upsertuser);
router.delete("/User/:id", usercontroller.deleteuser);

router.post("/User/login", usercontroller.login);
router.post("/User/refresh", usercontroller.refresh);
router.post("/User/logout", usercontroller.logout);

module.exports = router;