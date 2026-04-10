const express = require('express')
const router = express.Router()
const controller = require('../controllers/budget.controller')
const circuitValidateurcontroller = require('../services/budget.service');
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.post('/create', authmiddleware.authentificatetoken, controller.create) // CREATE
router.get('/', authmiddleware.authentificatetoken, controller.getAll) // READ ALL
router.get('/:id', authmiddleware.authentificatetoken, controller.getById) // READ ONE BY ID
router.patch('/update/:id', authmiddleware.authentificatetoken, controller.update) // UPDATE
router.delete('/delete/:id', authmiddleware.authentificatetoken, controller.delete) // DELETE
router.post('/duplicate/:id', authmiddleware.authentificatetoken, controller.duplicate) // DUPLICATE

router.get('/validateurs/:id', authmiddleware.authentificatetoken, circuitValidateurcontroller.get_validateurBudget) // READ VALIDATEURS
router.post('/validate/:id', authmiddleware.authentificatetoken, circuitValidateurcontroller.validerBudget) // UPDATE

module.exports = router