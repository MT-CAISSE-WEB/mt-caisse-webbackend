const express = require('express');
const router = express.Router();
const controller = require("../controllers/transfert.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.post('/transfert_fond', authmiddleware.authentificatetoken, controller.create_transfert);
router.get('/transfert_fond', authmiddleware.authentificatetoken, controller.getalltransfert);
router.put('/transfert_fond/:id', authmiddleware.authentificatetoken, controller.update_transfert);
//router.delete('/transfert/:id', controller.delete);
//router.put('/transfert/validate/:id', controller.validate);

module.exports = router;