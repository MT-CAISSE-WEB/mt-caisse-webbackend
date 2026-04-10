const express = require('express');
const router = express.Router();
const natureoperation_controller = require("../controllers/natureoperation.controller");
const multer = require('multer');
// config multer
const upload = multer({ dest: 'uploads/' });
const authmiddleware = require("../../../middlewares/auth.middlewre");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

// CRUD nature operation
router.get("/", authmiddleware.authentificatetoken, natureoperation_controller.get_natures); // OK
router.get("/:idnature", authmiddleware.authentificatetoken, natureoperation_controller.get_onenature); // OK
router.post("/create/", authmiddleware.authentificatetoken, natureoperation_controller.create_nature); // OK
router.put("/update/:idnature", authmiddleware.authentificatetoken, natureoperation_controller.update_nature);
router.delete("/delete/:idnature", authmiddleware.authentificatetoken, natureoperation_controller.delete_nature);
router.post('/import', upload.single('file'), authmiddleware.authentificatetoken, natureoperation_controller.import_nature);
router.post('/export', authmiddleware.authentificatetoken, natureoperation_controller.exportNatures);


module.exports = router;
