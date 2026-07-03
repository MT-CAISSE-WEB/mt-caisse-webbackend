// gestion_pj_demandes/models/index.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

// 1. Définir les modèles
const EnteteDemande = require("../../consultations/models/enteteDemande.model");
const PieceJointe = require("./pj.model");
const DemandePieceJointe = require("./pjdemande.model");

// 2. Associations
EnteteDemande.belongsToMany(PieceJointe, {
  through: DemandePieceJointe,
  foreignKey: "iddemande",
  otherKey: "idpiecejointe",
  as: "piecesJointes",
});

PieceJointe.belongsToMany(EnteteDemande, {
  through: DemandePieceJointe,
  foreignKey: "idpiecejointe",
  otherKey: "iddemande",
  as: "demandes",
});

// Associations directes (optionnelles mais utiles)
EnteteDemande.hasMany(DemandePieceJointe, { foreignKey: "iddemande" });
PieceJointe.hasMany(DemandePieceJointe, { foreignKey: "idpiecejointe" });
DemandePieceJointe.belongsTo(EnteteDemande, { foreignKey: "iddemande" });
DemandePieceJointe.belongsTo(PieceJointe, { foreignKey: "idpiecejointe" });

module.exports = {
  EnteteDemande,
  PieceJointe,
  DemandePieceJointe,
  sequelize, // Exporte aussi sequelize si besoin
};
