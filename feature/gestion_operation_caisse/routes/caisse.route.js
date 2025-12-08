const express = require('express');
const router = express.Router();
const caisse_controller = require("../controllers/caisse.controller");
const periodecaisse_controller = require("../controllers/caisseperiode.controller")
//const auth = require("../shared/middlewares/auth");

// CRUD CAISSE
router.get("/", caisse_controller.get_caisses);
router.get("/:id", caisse_controller.get_onecaisse);
router.post("/create/", caisse_controller.create_caisse);
router.put("/update/:id", caisse_controller.update_caisse);
router.delete("/delete/:id", caisse_controller.delete_caisse);

// Periode caisse
router.get("/periode/:id", periodecaisse_controller.get_recentperiode);
router.put("/open/:id", periodecaisse_controller.open_caisse);
router.post("/close/:id", periodecaisse_controller.fermeture_caisse);
router.post("/validate/:id", periodecaisse_controller.validate_caisse);

module.exports = router;
