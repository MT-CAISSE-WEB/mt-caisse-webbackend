const express = require('express');
const router = express.Router();
const banque_controller = require("../controllers/banque.controller");
const multer = require('multer');
// config multer
const upload = multer({ dest: 'uploads/' });
const authmiddleware = require("../../../middlewares/auth.middlewre");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

// CRUD nature operation
router.get("/", authmiddleware.authentificatetoken, banque_controller.get_banques); // OK
router.get("/:idbanque", authmiddleware.authentificatetoken, banque_controller.get_onebanque); // OK
router.post("/create/", authmiddleware.authentificatetoken, banque_controller.create_banque); // OK
router.put("/update/:idbanque", authmiddleware.authentificatetoken, banque_controller.update_banque);
router.delete("/delete/:idbanque", authmiddleware.authentificatetoken, banque_controller.delete_banque);
router.post('/import', upload.single('file'), authmiddleware.authentificatetoken, banque_controller.import_banque);
router.post('/export', authmiddleware.authentificatetoken, banque_controller.exportbanques);


module.exports = router;
