const express = require('express');
const router = express.Router();
const tiers_controller = require("../controllers/tiers.controller");
const multer = require('multer');
// config multer
const upload = multer({ dest: 'uploads/' });
const authmiddleware = require("../../../middlewares/auth.middlewre");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

// CRUD nature operation
router.get("/", authmiddleware.authentificatetoken, tiers_controller.get_tiers); // OK
router.get("/:idtiers", authmiddleware.authentificatetoken, tiers_controller.get_onetiers); // OK
router.post("/create/", authmiddleware.authentificatetoken, tiers_controller.create_tiers); // OK
router.put("/update/:idtiers", authmiddleware.authentificatetoken, tiers_controller.update_tiers); // OK
router.delete("/delete/:idtiers", authmiddleware.authentificatetoken, tiers_controller.delete_tiers); // OK
router.post('/import', upload.single('file'), authmiddleware.authentificatetoken, tiers_controller.import_tiers);
router.post('/export', authmiddleware.authentificatetoken, tiers_controller.exportTiers);

module.exports = router;
