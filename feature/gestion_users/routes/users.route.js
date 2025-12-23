const express = require('express');
const router = express.Router();
const usercontroller = require("../controllers/users.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

//router.get("/User",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'),usercontroller.getallusers);
router.get("/User",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN','Caissier'),usercontroller.getallusers);
router.get("/User/:id",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'), usercontroller.getoneuser);
router.post("/User",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'), usercontroller.upsertuser);
router.delete("/User/:id",authmiddleware.authentificatetoken,authmiddleware.authorizeRoles('ADMIN'), usercontroller.deleteuser);
router.post("/User/refresh",authmiddleware.authentificatetoken, usercontroller.refresh);
router.post("/User/logout",authmiddleware.authentificatetoken, usercontroller.logout);


router.post("/User/login", usercontroller.login);


module.exports = router;