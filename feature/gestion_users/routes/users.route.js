const express = require("express");
const router = express.Router();
const usercontroller = require("../controllers/users.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

// ============================================
// 2. ENSUITE les routes avec paramètres dynamiques
// ============================================

// Routes d'authentification
router.post("/User/login", usercontroller.login);
router.post("/User/refresh", usercontroller.refresh);
router.post("/User/logout", usercontroller.logout);

// Routes CRUD (avec paramètres)
router.get("/User", usercontroller.getallusers);
router.get(
  "/User/:id",
  authmiddleware.authentificatetoken,
  usercontroller.getoneuser,
);
router.post("/User", usercontroller.upsertuser);
router.delete(
  "/User/:id",
  authmiddleware.authentificatetoken,
  usercontroller.deleteuser,
);
router.put("/User/changepassword/:id", usercontroller.changepassword);

module.exports = router;
