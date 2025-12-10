const express = require('express')
const router = express.Router()
const controller = require('../controllers/budget.controller')

router.post('/create', controller.create) // CREATE
router.get('/', controller.getAll) // READ ALL
router.get('/:id', controller.getById) // READ ONE BY ID
router.patch('/update/:id', controller.update) // UPDATE
router.delete('/delete/:id', controller.delete) // DELETE
router.post('/duplicate/:id', controller.duplicate) // DUPLICATE

module.exports = router
