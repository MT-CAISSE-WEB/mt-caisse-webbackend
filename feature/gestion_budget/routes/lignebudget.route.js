const express = require('express')
const router = express.Router()
const ligne_budgetaire_controller = require('../controllers/lignebudget.controller')

// Création d'une ligne budgetaire
router.post('/create', ligne_budgetaire_controller.create_ligne_budgetaire)

// Récupération de toutes les banques
router.get('/', ligne_budgetaire_controller.get_all_lignes_budgetaire)

// Récupération d'une banque par son ID
router.get('/:id', ligne_budgetaire_controller.get_ligne_budgetaire_by_id)

// Mise à jour d'une banque
router.patch('/update/:id', ligne_budgetaire_controller.update_ligne_budgetaire)

// Suppression d'une banque
router.delete(
  '/delete/:id',
  ligne_budgetaire_controller.delete_ligne_budgetaire
)

// Duplication d'une banque
router.post(
  '/duplicate/:id',
  ligne_budgetaire_controller.duplicate_ligne_budgetaire
)

module.exports = router
