const Budget = require("../models/budget.model");
const {
  Departement,
  NatureOperation,
  CentreAnalytique,
} = require("../../gestion_demande_decaissement/models/foreign_models");

const BudgetDepartementNature = require("../models/lignebudget.model");

// Clés étrangères pour inclusion
const foreignIncludes = [
  {
    model: Budget,
    as: "budget",
    attributes: [
      "idbudget",
      "codebudget",
      "idbudgetparent",
      "libelle",
      "entite",
      "typebudget",
      "datedebut",
      "datefin",
      "actif",
      "isanalytique",
      "cloture",
      "valide",
      "idcircuitvalidation",
      "dernierniveau",
      "niveauactuel",
      "validedept",
      "datevalidedept",
      "validesite",
      "datevalidesite",
      "validesociete",
      "datevalidesociete",
      "idsite",
      "idsociete",
      "createdat",
      "createdby",
      "updatedat",
      "updatedby",
    ],
  },
  {
    model: Departement,
    as: "departement",
    attributes: [
      "iddepartement",
      "idsociete",
      "idsite",
      "responsable",
      "codedept",
      "libelle",
      "email",
      "telephone",
      "adresse",
      "createdat",
      "createdby",
      "updatedat",
      "updatedby",
    ],
  },
  {
    model: NatureOperation,
    as: "nature_operation",
    attributes: [
      "idnature",
      "codenature",
      "idsociete",
      "idcompte",
      "libelle",
      "decajustifier",
      "imputationtiers",
      "actif",
      "demandedecaissement",
      "createdat",
      "createdby",
      "updatedat",
      "updatedby",
    ],
  },
  {
    model: CentreAnalytique,
    as: "centre_analytique",
    attributes: [
      "idcentreanalytique",
      "idsociete",
      "codecentreanalytique",
      "libelle",
      "actif",
      "createdat",
      "createdby",
      "updatedat",
      "updatedby",
    ],
  },
];

// ========== CREATE ==========
exports.create = async (req, res) => {
  try {
    const {
      idbudget,
      montantprevisiondept,
      montantprevisionsite,
      montantprevisionsociete,
      // totalconsocloture,
      // soldecloture,
      createdby,
    } = req.body;

    // Vérification de tous les champs obligatoires
    const requiredFields = {
      idbudget,
      montantprevisiondept,
      montantprevisionsite,
      montantprevisionsociete,
      // totalconsocloture,
      // soldecloture,
      createdby,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(
        ([key, value]) => value === undefined || value === null || value === "",
      )
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Les champs suivants sont obligatoires : ${missingFields.join(
          ", ",
        )}`,
      });
    }

    // Ajout automatique des dates
    const newData = {
      ...req.body,
      createdat: new Date(),
    };

    const item = await BudgetDepartementNature.create(newData);

    // Recharger avec les relations pour la réponse
    const itemWithRelations = await BudgetDepartementNature.findByPk(
      item.idbudgetdepartementnature,
      {
        include: foreignIncludes,
      },
    );

    res.status(201).json({
      success: true,
      data: itemWithRelations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: `Erreur lors de la création de la ligne budgétaire: ${error}`,
    });
  }
};

// ========== GET ALL ==========
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const items = await BudgetDepartementNature.findAndCountAll({
      limit,
      offset,
      include: foreignIncludes,
      order: [["createdat", "DESC"]],
    });

    res.json({
      success: true,
      total: items.count,
      page,
      totalPages: Math.ceil(items.count / limit),
      data: items.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération," + error.message,
    });
  }
};

// ========== GET BY ID ==========
exports.getById = async (req, res) => {
  try {
    const item = await BudgetDepartementNature.findByPk(req.params.id, {
      include: foreignIncludes,
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, error: "Élément non trouvé." });
    res.json({ success: true, data: item });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Erreur lors de la récupération par ID" });
  }
};

// ========== UPDATE (PATCH) ==========
exports.update = async (req, res) => {
  try {
    const { updatedby, ...restBody } = req.body;

    if (!updatedby || updatedby === "") {
      return res.status(400).json({
        success: false,
        error: "Le champ updatedby est obligatoire pour la mise à jour.",
      });
    }

    // 1️⃣ Charger l'élément existant
    const item = await BudgetDepartementNature.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Élément non trouvé.",
      });
    }

    // 2️⃣ Construire les nouvelles valeurs
    const newData = {
      ...restBody,
      updatedby,
      updatedat: new Date(),
    };

    // 3 Mise à jour
    await item.update(newData);

    // 4 Recharger avec include pour renvoyer l'objet complet
    await item.reload({ include: foreignIncludes });

    res.json({
      success: true,
      data: item,
      message: "Mise à jour effectuée avec succès.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: `Erreur lors de la mise à jour: ${error.message}`,
    });
  }
};

// ========== DELETE ==========
exports.delete = async (req, res) => {
  try {
    const item = await BudgetDepartementNature.findByPk(req.params.id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, error: "Élément non trouvé" });
    }

    await item.destroy();
    res.json({ success: true, message: "Supprimé avec succès." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Erreur lors de la suppression" });
  }
};

// ========== DUPLICATE ==========
exports.duplicate = async (req, res) => {
  try {
    const id = req.params.id;
    const { createdby } = req.body;

    // Vérification des champs obligatoires
    if (!createdby) {
      return res.status(400).json({
        error: "Le champ 'createdby' est obligatoire pour la duplication.",
      });
    }

    // 1️⃣ Récupérer l'élément original
    const original = await BudgetDepartementNature.findByPk(id);
    if (!original) {
      return res
        .status(404)
        .json({ success: false, error: "Élément à dupliquer non trouvé" });
    }

    // 2️⃣ Convertir en objet simple et supprimer les champs à ne pas dupliquer
    const data = { ...original.get() };
    delete data.idbudgetdepartementnature; // Clé primaire
    delete data.createdat; // Champ créé automatiquement
    delete data.updatedat; // Champ mis à jour
    delete data.updatedby; // Champ mis à jour

    // 3️⃣ Ajouter les champs obligatoires et la date actuelle
    data.createdby = createdby;
    data.createdat = new Date();

    // 4️⃣ Créer la copie
    const duplicateItem = await BudgetDepartementNature.create(data);

    // Recharger avec les relations pour la réponse
    const itemWithRelations = await BudgetDepartementNature.findByPk(
      duplicateItem.idbudgetdepartementnature,
      {
        include: foreignIncludes,
      },
    );

    res.status(201).json({ success: true, data: itemWithRelations });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: `Erreur lors de la duplication: ${error}`,
    });
  }
};
