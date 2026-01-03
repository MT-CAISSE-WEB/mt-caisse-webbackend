const express = require('express')
const router = express.Router()
const budget_controller = require('../controllers/budget.controller')

// Création d'une banque
router.post('/create', budget_controller.create_budget)

// Récupération de toutes les banques
router.get('/', budget_controller.get_all_budgets)

// Récupération d'une banque par son ID
router.get('/:id', budget_controller.get_budget_by_id)

// Mise à jour d'une banque
router.patch('/update/:id', budget_controller.update_budget)

// Suppression d'une banque
router.delete('/delete/:id', budget_controller.delete_budget)

// Duplication d'une banque
router.post('/duplicate/:id', budget_controller.duplicate_budget)

module.exports = router
