// gestion_pj_demandes/models/index.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

// 1. Définir les modèles
const EnteteOperationCaisse = require("./enteteop.model");
const PieceJointe = require("../pj.model");
const OperationPieceJointe = require("./pjoperation.model");

// 2. Associations
EnteteOperationCaisse.belongsToMany(PieceJointe, {
  through: OperationPieceJointe,
  foreignKey: "idoperation",
  otherKey: "idpiecejointe",
  as: "piecesJointes",
});

PieceJointe.belongsToMany(EnteteOperationCaisse, {
  through: OperationPieceJointe,
  foreignKey: "idpiecejointe",
  otherKey: "idoperation",
  as: "operations",
});

// Associations directes (optionnelles mais utiles)
EnteteOperationCaisse.hasMany(OperationPieceJointe, {
  foreignKey: "idoperation",
});
PieceJointe.hasMany(OperationPieceJointe, {
  foreignKey: "idpiecejointe",
});
OperationPieceJointe.belongsTo(EnteteOperationCaisse, {
  foreignKey: "idoperation",
});
OperationPieceJointe.belongsTo(PieceJointe, {
  foreignKey: "idpiecejointe",
});

module.exports = {
  EnteteOperationCaisse,
  PieceJointe,
  OperationPieceJointe,
  sequelize, // Exporte aussi sequelize si besoin
};