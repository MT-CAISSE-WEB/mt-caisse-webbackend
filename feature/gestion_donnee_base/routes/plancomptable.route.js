const express = require('express');
const router = express.Router();
const plancomptable_controller = require("../controllers/plancomptable.controller");
const multer = require('multer');
// config multer
const upload = multer({ dest: 'uploads/' });
const authmiddleware = require("../../../middlewares/auth.middlewre");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);


// CRUD nature operation
router.get("/", authmiddleware.authentificatetoken, plancomptable_controller.get_comptes); // OK
router.get("/:idcompte", authmiddleware.authentificatetoken, plancomptable_controller.get_onecompte); // OK
router.post("/create", authmiddleware.authentificatetoken, plancomptable_controller.create_compte); // OK
router.put("/update/:idcompte", authmiddleware.authentificatetoken, plancomptable_controller.update_compte);
router.delete("/delete/:idcompte",authmiddleware.authentificatetoken, plancomptable_controller.delete_compte);
router.post('/import', upload.single('file'), authmiddleware.authentificatetoken, plancomptable_controller.import_plan_comptable);
router.post('/export', authmiddleware.authentificatetoken, plancomptable_controller.exportComptes);


module.exports = router;
