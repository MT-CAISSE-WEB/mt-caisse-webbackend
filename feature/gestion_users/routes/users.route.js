const express = require('express');
const router = express.Router();
const usercontroller = require("../controllers/users.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/User",authmiddleware.authentificatetoken, usercontroller.getallusers);
router.get("/User/:id",authmiddleware.authentificatetoken, usercontroller.getoneuser);
router.post("/User",authmiddleware.authentificatetoken, usercontroller.upsertuser);
router.delete("/User/:id",authmiddleware.authentificatetoken, usercontroller.deleteuser);
router.post("/User/refresh",authmiddleware.authentificatetoken, usercontroller.refresh);
router.post("/User/logout",authmiddleware.authentificatetoken, usercontroller.logout);


router.post("/User/login", usercontroller.login);


module.exports = router;