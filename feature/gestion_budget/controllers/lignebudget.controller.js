const ligne_budgetaire_service = require('../services/lignebudget.service')
const asyncHandler = require('../../../shared/middlewares/async')

/**
 * Crée une nouvelle ligne budgetaire
 */
module.exports.create_ligne_budgetaire = asyncHandler(
  async (req, res, next) => {
    try {
      const data = req.body
      const new_ligne_budget =
        await ligne_budgetaire_service.create_lignebudget(data)
      res.status(201).json({ success: true, data: new_ligne_budget })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  }
)

/**
 * Liste toutes les lignes budgétaires
 */

module.exports.get_all_lignes_budgetaire = asyncHandler(
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query
      const lignes_budgetaire =
        await ligne_budgetaire_service.get_all_lignes_budgetaires(page, limit)
      res.json({ success: true, data: lignes_budgetaire })
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: `Erreur serveur: ${error.message}` })
    }
  }
)

/**
 * Récupération d'une ligne budgétaire par son ID
 */
module.exports.get_ligne_budgetaire_by_id = asyncHandler(
  async (req, res, next) => {
    try {
      const { id } = req.params
      const ligne_budgetaire =
        await ligne_budgetaire_service.get_ligne_budgetaire_by_id(id)
      res.json({ success: true, data: ligne_budgetaire })
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: `Erreur serveur: ${error.message}` })
    }
  }
)

/**
 * Mise à jour d'une ligne budgétaire
 */

module.exports.update_ligne_budgetaire = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    await ligne_budgetaire_service.update_ligne_budgetaire(id, data)
    res.status(200).json({ message: 'Mise à jour réussie avec succès.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: `Erreur lors de la mise à jour: ${error.message}`,
    })
  }
}

/**
 * Suppression d'une ligne budgétaire
 */
module.exports.delete_ligne_budgetaire = asyncHandler(
  async (req, res, next) => {
    try {
      const { id } = req.params
      await ligne_budgetaire_service.delete_ligne_budgetaire(id)
      res.json({
        success: true,
        message: 'Ligne budgétaire supprimée avec succès.',
      })
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: `Erreur serveur: ${error.message}` })
    }
  }
)

/**
 * Dupliquer une ligne budgétaire
 */

module.exports.duplicate_ligne_budgetaire = asyncHandler(
  async (req, res, next) => {
    try {
      const { id } = req.params
      const { createdby } = req.body
      const ligne_budgetaire_duplicated =
        await ligne_budgetaire_service.duplicate_ligne_budgetaire(id, createdby)
      res.json({ success: true, data: ligne_budgetaire_duplicated })
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: `Erreur serveur: ${error.message}` })
    }
  }
)
