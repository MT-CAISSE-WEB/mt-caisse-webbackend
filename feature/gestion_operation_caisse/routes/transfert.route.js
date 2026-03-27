const express = require('express');
const router = express.Router();
const controller = require("../controllers/transfert.controller");

router.post('/transfert_fond', controller.create_transfert);
router.get('/transfert_fond', controller.getalltransfert);
router.put('/transfert_fond/:id', controller.update_transfert);
//router.delete('/transfert/:id', controller.delete);
//router.put('/transfert/validate/:id', controller.validate);

module.exports = router;