const express = require('express')
const router = express.Router()
const controller = require('../controllers/budget.controller')
const circuitValidateurcontroller = require('../services/budget.service');

router.post('/create', controller.create) // CREATE
router.get('/', controller.getAll) // READ ALL
router.get('/:id', controller.getById) // READ ONE BY ID
router.patch('/update/:id', controller.update) // UPDATE
router.delete('/delete/:id', controller.delete) // DELETE
router.post('/duplicate/:id', controller.duplicate) // DUPLICATE

router.get('/validateurs/:id', circuitValidateurcontroller.get_validateurBudget) // READ VALIDATEURS
router.post('/validate/:id', circuitValidateurcontroller.validerBudget) // UPDATE

module.exports = router