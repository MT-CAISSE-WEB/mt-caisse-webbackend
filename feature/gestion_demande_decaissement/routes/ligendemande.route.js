const express = require('express')
const router = express.Router()
const controller = require('../controllers/lignedemande.controller')
const authmiddleware = require("../../../middlewares/auth.middlewre");

//router.post('/create', authmiddleware.authentificatetoken, controller.create) // CREATE
//router.get('/', authmiddleware.authentificatetoken, controller.getAll) // READ ALL
//router.get('/:id', authmiddleware.authentificatetoken, controller.getById) // READ ONE BY ID
//router.patch('/update/:id', authmiddleware.authentificatetoken, controller.update) // UPDATE
router.delete('/delete/:id', authmiddleware.authentificatetoken, controller.delete) // DELETE
//router.post('/duplicate/:id', authmiddleware.authentificatetoken, controller.duplicate) // DUPLICATE

module.exports = router
