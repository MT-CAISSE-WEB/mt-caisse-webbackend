const budget_service = require('../services/budget.service')
const asyncHandler = require('../../../shared/middlewares/async')

/**
 * Crée un nouveau budget
 */
module.exports.create_budget = asyncHandler(async (req, res, next) => {
  try {
    const data = req.body
    const new_budget = await budget_service.create_budget(data)
    res.status(201).json({ success: true, data: new_budget })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
})

/**
 * Liste toutes les banques
 */

module.exports.get_all_budgets = asyncHandler(async (req, res, next) => {
  try {
    const budgets = await budget_service.get_all_budgets()
    res.json({ success: true, data: budgets })
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Erreur serveur: ${error.message}` })
  }
})

/**
 * Récupération d'un budget par son ID
 */
module.exports.get_budget_by_id = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params
    const budget = await budget_service.get_budget_by_id(id)
    res.json({ success: true, data: budget })
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Erreur serveur: ${error.message}` })
  }
})

/**
 * Mise à jour d'un budget
 */

module.exports.update_budget = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    console.log('Data:', data)

    await budget_service.update_budget(id, data)
    res.status(200).json({ message: 'Mise à jour réussie avec succès.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: `Erreur lors de la mise à jour: ${error.message}`,
    })
  }
}

/**
 * Suppression d'un budget
 */
module.exports.delete_budget = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params
    await budget_service.delete_budget(id)
    res.json({ success: true, message: 'Budget supprimé avec succès.' })
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Erreur serveur: ${error.message}` })
  }
})

/**
 * Dupliquer un budget
 */

module.exports.duplicate_budget = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params
    const { code, createdby } = req.body
    const budget = await budget_service.duplicate_budget(id, code, createdby)
    res.json({ success: true, data: budget })
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Erreur serveur: ${error.message}` })
  }
})
