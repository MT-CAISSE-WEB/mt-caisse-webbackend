const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

// 1. Définir les modèles
const Justificatif = require("./justificatif.model");
const PieceJointe = require("../../models/pj.model");
const JustificatifPieceJointe = require("./pjjustificatif.model");

// 2. Associations
Justificatif.belongsToMany(PieceJointe, {
    through: JustificatifPieceJointe,
    foreignKey: "idjustificatifoperation",
    otherKey: "idpiecejointe",
    as: "piecesJointes",
});

PieceJointe.belongsToMany(Justificatif, {
    through: JustificatifPieceJointe,
    foreignKey: "idpiecejointe",
    otherKey: "idjustificatifoperation",
    as: "justificatifsAssocies",
});

// Associations directes (optionnelles mais utiles)
Justificatif.hasMany(JustificatifPieceJointe, {
    foreignKey: "idjustificatifoperation",
});
PieceJointe.hasMany(JustificatifPieceJointe, {
    foreignKey: "idpiecejointe",
});
JustificatifPieceJointe.belongsTo(Justificatif, {
    foreignKey: "idjustificatifoperation",
});
JustificatifPieceJointe.belongsTo(PieceJointe, {
    foreignKey: "idpiecejointe",
});

module.exports = {
    Justificatif,
    PieceJointe,
    JustificatifPieceJointe,
    sequelize, // Exporte aussi sequelize si besoin
};
