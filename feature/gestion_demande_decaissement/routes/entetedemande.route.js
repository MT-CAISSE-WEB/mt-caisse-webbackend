const express = require('express')
const router = express.Router()
const controller = require('../controllers/entetedemande.controller')
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.post('/create', authmiddleware.authentificatetoken, controller.create) // CREATE
router.get('/', authmiddleware.authentificatetoken, controller.getAll) // READ ALL
router.get('/:id', authmiddleware.authentificatetoken,controller.getById) // READ ONE BY ID
router.put('/update/:id', authmiddleware.authentificatetoken, controller.update) // UPDATE
router.post('/validate/:id', authmiddleware.authentificatetoken, controller.validate) // UPDATE
router.post('/tauxdevise/recent', authmiddleware.authentificatetoken, controller.gettauxrecent) // UPDATE
router.get('/avalider/:id', authmiddleware.authentificatetoken, controller.getDemandeAvalider) // READ
router.get('/validateurs/:id', authmiddleware.authentificatetoken, controller.getValidateursCircuit) // READ
router.get('/detail/budget/:id', authmiddleware.authentificatetoken, controller.getDetailBudget) // READ
router.delete('/delete/:id', authmiddleware.authentificatetoken, controller.delete) // DELETE
//router.post('/duplicate/:id', authmiddleware.authentificatetoken, controller.duplicate) // DUPLICATE 

module.exports = router
