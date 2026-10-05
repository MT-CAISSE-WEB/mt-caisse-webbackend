// gestion_pj_demandes/models/index.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

// 1. Définir les modèles
const Budget = require("../../../gestion_budget/models/budget.model");
const PieceJointe = require("../pj.model");
const BudgetPieceJointe = require("./pjbudget.model");

// 2. Associations
Budget.belongsToMany(PieceJointe, {
  through: BudgetPieceJointe,
  foreignKey: "idbudget",
  otherKey: "idpiecejointe",
  as: "piecesJointes",
});

PieceJointe.belongsToMany(Budget, {
  through: BudgetPieceJointe,
  foreignKey: "idpiecejointe",
  otherKey: "idbudget",
  as: "budgetsAssocies",
});

// Associations directes (optionnelles mais utiles)
Budget.hasMany(BudgetPieceJointe, {
  foreignKey: "idbudget",
});
PieceJointe.hasMany(BudgetPieceJointe, {
  foreignKey: "idpiecejointe",
});
BudgetPieceJointe.belongsTo(Budget, {
  foreignKey: "idbudget",
});
BudgetPieceJointe.belongsTo(PieceJointe, {
  foreignKey: "idpiecejointe",
});

module.exports = {
  Budget,
  PieceJointe,
  BudgetPieceJointe,
  sequelize, // Exporte aussi sequelize si besoin
};
