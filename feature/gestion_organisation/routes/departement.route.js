const express = require('express')
const router = express.Router()
const departementcontroller = require('../controllers/departement.controller')
const authmiddleware = require('../../../middlewares/auth.middlewre')

// router.get("/Departement",authmiddleware.authentificatetoken, departementcontroller.getalldepartement);
router.get('/Departement', departementcontroller.getalldepartement)
router.get(
  '/Departement',
  authmiddleware.authentificatetoken,
  departementcontroller.getalldepartement
)
router.get(
  '/Departement/:id',
  authmiddleware.authentificatetoken,
  departementcontroller.getonedepartement
)
router.post(
  '/Departement',
  authmiddleware.authentificatetoken,
  departementcontroller.upsertdepartement
)
router.delete(
  '/Departement/:id',
  authmiddleware.authentificatetoken,
  departementcontroller.deletedepartement
)

module.exports = router
