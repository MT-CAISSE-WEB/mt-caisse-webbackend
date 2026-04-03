const express = require('express');
const router = express.Router();
const caisse_controller = require("../controllers/caisse.controller");
const periodecaisse_controller = require("../controllers/caisseperiode.controller")
const authmiddleware = require("../../../middlewares/auth.middlewre");

// CRUD CAISSE
router.get("/", authmiddleware.authentificatetoken, caisse_controller.get_caisses);
router.get("/actif", authmiddleware.authentificatetoken, caisse_controller.get_caisses);
router.get("/:id", authmiddleware.authentificatetoken, caisse_controller.get_onecaisse);
router.get("/solde/user", authmiddleware.authentificatetoken, caisse_controller.getSolde);
router.post("/create/", authmiddleware.authentificatetoken, caisse_controller.create_caisse);
router.put("/update/:id", authmiddleware.authentificatetoken, caisse_controller.update_caisse);
router.delete("/delete/:id", authmiddleware.authentificatetoken, caisse_controller.delete_caisse);

// Periode caisse
router.get("/periode/:id", authmiddleware.authentificatetoken, periodecaisse_controller.get_recentperiode);
router.put("/open/:id", authmiddleware.authentificatetoken, periodecaisse_controller.open_caisse);
router.put("/close/:id", authmiddleware.authentificatetoken, periodecaisse_controller.fermeture_caisse);
router.post("/validate/:id", authmiddleware.authentificatetoken, periodecaisse_controller.validate_caisse);
router.post("/billetage", authmiddleware.authentificatetoken, periodecaisse_controller.create_billetage);

module.exports = router;
