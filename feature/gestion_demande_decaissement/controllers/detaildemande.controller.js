const DetailsDemande = require('../models/detaildemande.model')
const { Societe } = require('../models/foreign_models')

const EnteteDemande = require('../models/entetedemande.model')
const LigneDemande = require('../models/lignedemande.model')

// Clés étrangères pour inclusion
const foreignIncludes = [
  {
    model: EnteteDemande,
    as: 'entete',
    attributes: [
      'iddemande',
      'codedemande',
      'iddemandeur',
      'typedemande',
      'libelledemande',
      'datedemande',
      'decaisse',
      'solde',
      'statut',
      'idcircuit',
      'idsociete',
      'idsite',
      'iddepartement',
      'iddevise',
      'createdat',
      'createdby',
      'updatedat',
      'updatedby',
    ],
  },
  {
    model: LigneDemande,
    as: 'ligne_demande',
    attributes: [
      'idlignedemande',
      'iddemande',
      'numligne',
      'libellelignedemande',
      'montantdemande',
      'idnature',
      'idbudget',
      'idcentre',
      'idsociete',
      'idsite',
      'createdat',
      'createdby',
      'updatedat',
      'updatedby',
    ],
  },

  {
    model: Societe,
    as: 'societe',
    attributes: [
      'idsociete',
      'codesociete',
      'iddevisereference',
      'iddevisereporting',
      'raisonsociale',
      'sigle',
      'rccm',
      'numnui',
      'email',
      'telephone',
      'logo',
      'adresse',
      'suivibudgetaire',
      'createdat',
      'createdby',
      'updatedat',
      'updatedby',
    ],
  },
]

// ========== CREATE ==========
exports.create = async (req, res) => {
  try {
    const {
      iddemande,
      idlignedemande,
      description,
      quantite,
      montant,
      createdby,
    } = req.body

    // Vérification de tous les champs obligatoires
    const requiredFields = {
      iddemande,
      idlignedemande,
      description,
      quantite,
      montant,
      createdby,
    }

    const missingFields = Object.entries(requiredFields)
      .filter(
        ([key, value]) => value === undefined || value === null || value === ''
      )
      .map(([key]) => key)

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Les champs suivants sont obligatoires : ${missingFields.join(
          ', '
        )}`,
      })
    }

    // Ajout automatique des dates
    const newData = {
      ...req.body,
      createdat: new Date(),
    }

    const item = await DetailsDemande.create(newData)

    // Recharger avec les relations pour la réponse
    const itemWithRelations = await DetailsDemande.findByPk(
      item.iddetailsdemande,
      {
        include: foreignIncludes,
      }
    )

    res.status(201).json({
      success: true,
      data: itemWithRelations,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      error: `Erreur lors de la création du détail de la demande: ${error}`,
    })
  }
}

// ========== GET ALL ==========
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    const items = await DetailsDemande.findAndCountAll({
      limit,
      offset,
      include: foreignIncludes,
      order: [['createdat', 'ASC']],
    })

    res.json({
      success: true,
      total: items.count,
      page,
      totalPages: Math.ceil(items.count / limit),
      data: items.rows,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la ligne.',
    })
  }
}

// ========== GET BY ID ==========
exports.getById = async (req, res) => {
  try {
    const item = await DetailsDemande.findByPk(req.params.id, {
      include: foreignIncludes,
    })
    if (!item)
      return res
        .status(404)
        .json({ success: false, error: 'Élément non trouvé.' })
    res.json({ success: true, data: item })
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: 'Erreur lors de la récupération par ID' })
  }
}

// ========== UPDATE (PATCH) ==========
exports.update = async (req, res) => {
  try {
    const { updatedby, ...restBody } = req.body

    if (!updatedby || updatedby === '') {
      return res.status(400).json({
        success: false,
        error: 'Le champ updatedby est obligatoire pour la mise à jour.',
      })
    }

    // 1️⃣ Charger l'élément existant
    const item = await DetailsDemande.findByPk(req.params.id)
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Élément non trouvé.',
      })
    }

    // 2️⃣ Construire les nouvelles valeurs
    const newData = {
      ...restBody,
      updatedby,
      updatedat: new Date(),
    }

    // 4️⃣ Mise à jour
    await item.update(newData)

    // 5️⃣ Recharger avec include pour renvoyer l'objet complet
    await item.reload({ include: foreignIncludes })

    res.json({
      success: true,
      data: item,
      message: 'Mise à jour effectuée avec succès.',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      error: `Erreur lors de la mise à jour: ${error.message}`,
    })
  }
}

// ========== DELETE ==========
exports.delete = async (req, res) => {
  try {
    const item = await DetailsDemande.findByPk(req.params.id)

    if (!item) {
      return res
        .status(404)
        .json({ success: false, error: 'Élément non trouvé' })
    }

    await item.destroy()
    res.json({ success: true, message: 'Supprimé avec succès.' })
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: 'Erreur lors de la suppression' })
  }
}

// ========== DUPLICATE ==========
exports.duplicate = async (req, res) => {
  try {
    const id = req.params.id
    const { createdby } = req.body

    // Vérification des champs obligatoires
    if (!createdby) {
      return res.status(400).json({
        error: "Le champ 'createdby' est obligatoire pour la duplication.",
      })
    }

    // 1️⃣ Récupérer l'élément original
    const original = await DetailsDemande.findByPk(id)
    if (!original) {
      return res
        .status(404)
        .json({ success: false, error: 'Élément à dupliquer non trouvé' })
    }

    // 2️⃣ Convertir en objet simple et supprimer les champs à ne pas dupliquer
    const data = { ...original.get() }
    delete data.iddetailsdemande // Clé primaire
    delete data.createdat // Champ créé automatiquement
    delete data.updatedat // Champ mis à jour
    delete data.updatedby // Champ mis à jour

    // 3️⃣ Ajouter les champs obligatoires et la date actuelle
    data.createdby = createdby
    data.createdat = new Date()

    // 4️⃣ Créer la copie
    const duplicateItem = await DetailsDemande.create(data)

    // Recharger avec les relations pour la réponse
    const itemWithRelations = await DetailsDemande.findByPk(
      duplicateItem.iddetailsdemande,
      {
        include: foreignIncludes,
      }
    )

    res.status(201).json({ success: true, data: itemWithRelations })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      error: `Erreur lors de la duplication: ${error}`,
    })
  }
}