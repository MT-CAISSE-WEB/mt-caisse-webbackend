const express = require('express');
const router = express.Router();
const banque_controller = require("../controllers/banque.controller");
const multer = require('multer');
// config multer
const upload = multer({ dest: 'uploads/' });
//const auth = require("../shared/middlewares/auth");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

// CRUD nature operation
router.get("/", banque_controller.get_banques); // OK
router.get("/:idbanque", banque_controller.get_onebanque); // OK
router.post("/create/", banque_controller.create_banque); // OK
router.put("/update/:idbanque", banque_controller.update_banque);
router.delete("/delete/:idbanque", banque_controller.delete_banque);
router.post('/import', upload.single('file'), banque_controller.import_banque);
router.post('/export', banque_controller.exportbanques);


module.exports = router;
