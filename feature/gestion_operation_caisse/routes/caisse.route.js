const express = require('express');
const router = express.Router();
const caisse_controller = require("../controllers/caisse.controller");
const periodecaisse_controller = require("../controllers/caisseperiode.controller")
const authmiddleware = require("../../../middlewares/auth.middlewre");

// CRUD CAISSE
router.get("/", authmiddleware.authentificatetoken, caisse_controller.get_caisses);
router.get("/actif", authmiddleware.authentificatetoken, caisse_controller.get_caisses);
router.get("/solde/user", authmiddleware.authentificatetoken, caisse_controller.getSolde);

// ROUTE AVEC PARAMETRES ID 
router.get("/:id", authmiddleware.authentificatetoken, caisse_controller.get_onecaisse);
router.post("/validate/:id", authmiddleware.authentificatetoken, periodecaisse_controller.validate_caisse);
router.delete("/delete/:id", authmiddleware.authentificatetoken, caisse_controller.delete_caisse);
router.put("/update/:id", authmiddleware.authentificatetoken, caisse_controller.update_caisse);
router.get("/periode/:id", authmiddleware.authentificatetoken, periodecaisse_controller.get_recentperiode);
router.put("/open/:id", authmiddleware.authentificatetoken, periodecaisse_controller.open_caisse);
router.put("/close/:id", authmiddleware.authentificatetoken, periodecaisse_controller.fermeture_caisse);

// AUTRES ROUTES SANS PARAMETRES ID
router.post("/create/", authmiddleware.authentificatetoken, caisse_controller.create_caisse);
router.post("/billetage", authmiddleware.authentificatetoken, periodecaisse_controller.create_billetage);
router.post("/recalculate", authmiddleware.authentificatetoken, periodecaisse_controller.recalculate_solde);
router.post("/tresorerie", authmiddleware.authentificatetoken, periodecaisse_controller.get_caisse_tresorerie_by_date);

module.exports = router;
