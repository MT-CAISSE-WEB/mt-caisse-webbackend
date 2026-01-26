const express = require('express');
const router = express.Router();
const usercontroller = require("../controllers/users.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

//router.get("/User",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'),usercontroller.getallusers);
//router.get("/User",authmiddleware.authentificatetoken,usercontroller.getallusers);
router.get("/User",usercontroller.getallusers);
router.get("/User/:id",authmiddleware.authentificatetoken, usercontroller.getoneuser);
router.post("/User", usercontroller.upsertuser);
router.delete("/User/:id",authmiddleware.authentificatetoken, usercontroller.deleteuser);
router.post("/User/refresh",authmiddleware.authentificatetoken, usercontroller.refresh);
router.post("/User/logout",authmiddleware.authentificatetoken, usercontroller.logout);
router.put("/User/changepassword/:id",usercontroller.changepassword);


router.post("/User/login", usercontroller.login);
router.post("/User/refresh", usercontroller.refresh);
router.post("/User/logout", usercontroller.logout);

module.exports = router;