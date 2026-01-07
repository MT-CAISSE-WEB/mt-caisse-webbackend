const express = require('express')
const router = express.Router()
const controller = require('../controllers/entetedemande.controller')

router.post('/create', controller.create) // CREATE
router.get('/', controller.getAll) // READ ALL
router.get('/:id', controller.getById) // READ ONE BY ID
router.put('/update/:id', controller.update) // UPDATE
router.post('/validate/:id', controller.validate) // UPDATE
router.get('/avalider/:id', controller.getDemandeAvalider) // READ
router.get('/validateurs/:id', controller.getValidateursCircuit) // READ
router.get('/detail/budget/:id', controller.getDetailBudget) // READ
router.delete('/delete/:id', controller.delete) // DELETE
//router.post('/duplicate/:id', controller.duplicate) // DUPLICATE

module.exports = router
