const express = require('express');
const router = express.Router();
const centreanalytique_controller = require("../controllers/centreanalytique.controller");
const multer = require('multer');
// config multer
const upload = multer({ dest: 'uploads/' });
//const auth = require("../shared/middlewares/auth");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

// CRUD nature operation
router.get("/", centreanalytique_controller.get_allcentres); // OK
router.get("/:idcentre", centreanalytique_controller.get_onecentre); // OK
router.post("/create", centreanalytique_controller.create_centre); // OK
router.put("/update/:idcentre", centreanalytique_controller.update_centre);
router.delete("/delete/:idcentre", centreanalytique_controller.delete_centre);
router.post('/import', upload.single('file'), centreanalytique_controller.import_centre_analytique);
router.post('/export', centreanalytique_controller.exportCentres);


module.exports = router;
