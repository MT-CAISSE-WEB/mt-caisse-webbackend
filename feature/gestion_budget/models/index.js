// Import des modèles
const Budget = require("./budget.model");
const ValidationBudget = require("./validationBudget.model");
const {
  CircuitValidation,
  Site,
  Societe,
} = require("../../gestion_demande_decaissement/models/foreign_models");

// Budget
Budget.belongsTo(Budget, {
  foreignKey: "idbudgetparent",
  as: "buget_parent",
});

Budget.hasMany(Budget, {
  foreignKey: "idbudgetparent",
  as: "budget_enfant",
});

// Circuit de validation
Budget.belongsTo(CircuitValidation, {
  foreignKey: "idcircuitvalidation",
  as: "circuit",
});

// Société
Budget.belongsTo(Societe, {
  foreignKey: "idsociete",
  as: "societe",
});

// Site
Budget.belongsTo(Site, {
  foreignKey: "idsite",
  as: "site",
});

// Définition des associations
// Budget - ValidationBudget (One-to-Many)
Budget.hasMany(ValidationBudget, {
  foreignKey: "idbudget",
  as: "validations",
  sourceKey: "idbudget",
  onDelete: "CASCADE", // ou 'CASCADE' selon votre besoin
  onUpdate: "CASCADE",
});

ValidationBudget.belongsTo(Budget, {
  foreignKey: "idbudget",
  as: "budget",
  targetKey: "idbudget",
});

module.exports = {
  Budget,
  ValidationBudget,
};