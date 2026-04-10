const express = require('express');
const router = express.Router();
const centreanalytique_controller = require("../controllers/centreanalytique.controller");
const multer = require('multer');
// config multer
const upload = multer({ dest: 'uploads/' });
const authmiddleware = require("../../../middlewares/auth.middlewre");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

// CRUD nature operation
router.get("/", authmiddleware.authentificatetoken, centreanalytique_controller.get_allcentres); // OK
router.get("/:idcentre", authmiddleware.authentificatetoken, centreanalytique_controller.get_onecentre); // OK
router.post("/create", authmiddleware.authentificatetoken, centreanalytique_controller.create_centre); // OK
router.put("/update/:idcentre", authmiddleware.authentificatetoken, centreanalytique_controller.update_centre);
router.delete("/delete/:idcentre", authmiddleware.authentificatetoken, centreanalytique_controller.delete_centre);
router.post('/import', upload.single('file'), authmiddleware.authentificatetoken, centreanalytique_controller.import_centre_analytique);
router.post('/export', authmiddleware.authentificatetoken, centreanalytique_controller.exportCentres);


module.exports = router;
