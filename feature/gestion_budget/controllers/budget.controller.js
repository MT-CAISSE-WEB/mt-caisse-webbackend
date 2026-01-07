const Budget = require('../models/budget.model')
const {
  CircuitValidation,
  Site,
  Societe,
} = require('../../gestion_demande_decaissement/models/foreign_models')

// Clés étrangères pour inclusion
const foreignIncludes = [
  {
    model: CircuitValidation,
    as: 'circuit',
    attributes: [
      'idcircuitvalidation',
      'codecircuitvalidation',
      'typeentite',
      'typeaction',
      'idsociete',
      'idsite',
      // 'iddepartement',
      // 'nombrevalidateur',
      'actif',
      'createdat',
      'createdby',
      'updatedat',
      'updatedby',
    ],
  },
  {
    model: Site,
    as: 'site',
    attributes: [
      'idsite',
      'codesite',
      'idsociete',
      'idcentreanalytique',
      'libelle',
      'email',
      'telephone',
      'adresse',
      'estcentreanalytique',
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
      codebudget,
      datedebut,
      typebudget,
      datefin,
      createdby,
      idbudgetparent,
    } = req.body

    // Vérification de tous les champs obligatoires
    const requiredFields = {
      codebudget,
      datedebut,
      typebudget,
      datefin,
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

    if (typebudget === 'Annuel' && idbudgetparent) {
      return res.status(400).json({
        success: false,
        error:
          "idbudgetparent ne doit PAS être renseigné lorsque typebudget = 'Annuel'.",
      })
    }

    // 2) Si typebudget = Mensuel → idbudgetparent doit être renseigné
    if (typebudget === 'Mensuel' && !idbudgetparent) {
      return res.status(400).json({
        success: false,
        error:
          "idbudgetparent doit être renseigné lorsque typebudget = 'Mensuel'.",
      })
    }

    // Ajout automatique des dates
    const newData = {
      ...req.body,
      createdat: new Date(),
    }

    console.log('Data created:', newData)

    const item = await Budget.create(newData)

    // Recharger avec les relations pour la réponse
    const itemWithRelations = await Budget.findByPk(item.idbudget, {
      include: foreignIncludes,
    })

    res.status(201).json({
      success: true,
      data: itemWithRelations,
    })
  } catch (error) {
    console.error('Erreur serveur:', error.message)
    res.status(500).json({
      success: false,
      error: `Erreur lors de la création du budget: ${error}`,
    })
  }
}

// ========== GET ALL ==========
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    const items = await Budget.findAndCountAll({
      limit,
      offset,
      include: foreignIncludes,
      order: [['createdat', 'DESC']],
    })

    res.json({
      success: true,
      total: items.count,
      page,
      totalPages: Math.ceil(items.count / limit),
      data: items.rows,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ========== GET BY ID ==========
exports.getById = async (req, res) => {
  try {
    const item = await Budget.findByPk(req.params.id, {
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
    // console.log('Updated data:', req.body)
    const { updatedby, ...restBody } = req.body

    if (!updatedby || updatedby === '') {
      return res.status(400).json({
        success: false,
        error: 'Le champ updatedby est obligatoire pour la mise à jour.',
      })
    }

    // 1️⃣ Charger l'élément existant
    const item = await Budget.findByPk(req.params.id)
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Élément non trouvé.',
      })
    }

    if ('idbudgetparent' in restBody) {
      return res.status(400).json({
        success: false,
        error:
          'Il est interdit de modifier idbudgetparent après la création du budget.',
      })
    }

    if ('typebudget' in restBody) {
      return res.status(400).json({
        success: false,
        error:
          'Il est interdit de modifier typebudget après la création du budget.',
      })
    }

    // 2️⃣ Construire les nouvelles valeurs
    const newData = {
      ...restBody,
      updatedby,
      updatedat: new Date(),
    }

    // 3 Mise à jour
    await item.update(newData)

    // 4 Recharger avec include pour renvoyer l'objet complet
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
    const item = await Budget.findByPk(req.params.id)

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
    const { createdby, codebudget } = req.body

    // Vérification des champs obligatoires
    if (!createdby || !codebudget) {
      return res.status(400).json({
        error:
          "Les champs 'createdby' et 'codebudget' sont obligatoires pour la duplication.",
      })
    }

    // 1️⃣ Récupérer l'élément original
    const original = await Budget.findByPk(id)
    if (!original) {
      return res
        .status(404)
        .json({ success: false, error: 'Élément à dupliquer non trouvé' })
    }

    // 2️⃣ Convertir en objet simple et supprimer les champs à ne pas dupliquer
    const data = { ...original.get() }
    delete data.idbudget // Clé primaire
    delete data.createdat // Champ créé automatiquement
    delete data.updatedat // Champ mis à jour
    delete data.updatedby // Champ mis à jour

    // 3️⃣ Ajouter les champs obligatoires et la date actuelle
    data.createdby = createdby
    data.codebudget = codebudget
    data.createdat = new Date()

    // 4️⃣ Créer la copie
    const duplicateItem = await Budget.create(data)

    // Recharger avec les relations pour la réponse
    const itemWithRelations = await Budget.findByPk(duplicateItem.idbudget, {
      include: foreignIncludes,
    })

    res.status(201).json({ success: true, data: itemWithRelations })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      error: `Erreur lors de la duplication: ${error}`,
    })
  }
}
