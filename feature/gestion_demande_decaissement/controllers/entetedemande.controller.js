const EnteteDemande = require('../models/entetedemande.model')
const {
  Utilisateur,
  CircuitValidation,
  Departement,
  Site,
  Societe,
  Devise,
} = require('../models/foreign_models')

// Clés étrangères pour inclusion
const foreignIncludes = [
  {
    model: Utilisateur,
    as: 'demandeur',
    attributes: [
      'idutilisateur',
      'codeutilisateur',
      'nom',
      'prenom',
      'adresse',
      'telephone',
      'email',
      'typeentitesite',
      'typeentitedepartement',
      'typeentitesociete',
      'acheteur',
      'iddepartement',
      'idsociete',
      'idsite',
      'login',
      'password',
      'createdat',
      'createdby',
      'updatedat',
      'updatedby',
    ],
  },
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
      'iddepartement',
      'nombrevalidateur',
      'actif',
      'createdat',
      'createdby',
      'updatedat',
      'updatedby',
    ],
  },
  {
    model: Departement,
    as: 'departement',
    attributes: [
      'iddepartement',
      'idsociete',
      'idsite',
      'responsable',
      'codedept',
      'libelle',
      'email',
      'telephone',
      'adresse',
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
  {
    model: Devise,
    as: 'devise',
    attributes: [
      'iddevise',
      'codedevise',
      'intitule',
      'codeiso',
      'actif',
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
    const { codedemande, typedemande, libelledemande, createdby } = req.body

    // Vérification de tous les champs obligatoires
    const requiredFields = {
      codedemande,
      typedemande,
      libelledemande,
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
      datedemande: new Date(),
      createdat: new Date(),
    }

    const item = await EnteteDemande.create(newData)

    // Recharger avec les relations pour la réponse
    const itemWithRelations = await EnteteDemande.findByPk(item.iddemande, {
      include: foreignIncludes,
    })

    res.status(201).json({
      success: true,
      data: itemWithRelations,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      error: `Erreur lors de la création de la demande de décaisse: ${error}`,
    })
  }
}

// ========== GET ALL ==========
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    const items = await EnteteDemande.findAndCountAll({
      limit,
      offset,
      include: foreignIncludes,
    })

    res.json({
      success: true,
      total: items.count,
      page,
      totalPages: Math.ceil(items.count / limit),
      data: items.rows,
    })
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: 'Erreur lors de la récupération' })
  }
}

// ========== GET BY ID ==========
exports.getById = async (req, res) => {
  try {
    const item = await EnteteDemande.findByPk(req.params.id, {
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
    const item = await EnteteDemande.findByPk(req.params.id)
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
    const item = await EnteteDemande.findByPk(req.params.id)

    if (!item) {
      return res
        .status(404)
        .json({ success: false, error: 'Élément non trouvé' })
    }

    await item.destroy()
    res.json({ sucess: true, message: 'Supprimé avec succès.' })
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
    const { createdby, codedemande } = req.body

    // Vérification des champs obligatoires
    if (!createdby || !codedemande) {
      return res.status(400).json({
        error:
          "Les champs 'createdby' et 'codedemande' sont obligatoires pour la duplication.",
      })
    }

    // 1️⃣ Récupérer l'élément original
    const original = await EnteteDemande.findByPk(id)
    if (!original) {
      return res
        .status(404)
        .json({ success: false, error: 'Élément à dupliquer non trouvé' })
    }

    // 2️⃣ Convertir en objet simple et supprimer les champs à ne pas dupliquer
    const data = { ...original.get() }
    delete data.iddemande // Clé primaire
    delete data.createdat // Champ créé automatiquement
    delete data.updatedat // Champ mis à jour
    delete data.updatedby // Champ mis à jour

    // 3️⃣ Ajouter les champs obligatoires et la date actuelle
    data.createdby = createdby
    data.codedemande = codedemande
    data.createdat = new Date()

    // (Optionnel) Ajouter un suffixe pour la copie dans le libellé
    if (data.libelledemande) {
      data.libelledemande = data.libelledemande + ' (Copie)'
    }

    // 4️⃣ Créer la copie
    const duplicateItem = await EnteteDemande.create(data)

    // Recharger avec les relations pour la réponse
    const itemWithRelations = await EnteteDemande.findByPk(
      duplicateItem.iddemande,
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
