const sequelize = require("../../../config/database");

const {
  Departement,
  AffectationDepartementNature,
  NatureOperation,
} = require("../../gestion_demande_decaissement/models/foreign_models");

const LigneDemande = require("./ligneDemande.model");
const EnteteDemande = require("./enteteDemande.model");

// Département → Affectation
Departement.hasMany(AffectationDepartementNature, {
  foreignKey: "iddepartement",
  as: "affectations",
});
AffectationDepartementNature.belongsTo(Departement, {
  foreignKey: "iddepartement",
});

// Nature → Affectation
NatureOperation.hasMany(AffectationDepartementNature, {
  foreignKey: "idnature",
});
AffectationDepartementNature.belongsTo(NatureOperation, {
  foreignKey: "idnature",
  as: "nature",
});

// Many-to-Many automatique
Departement.belongsToMany(NatureOperation, {
  through: AffectationDepartementNature,
  foreignKey: "iddepartement",
  otherKey: "idnature",
});

NatureOperation.belongsToMany(Departement, {
  through: AffectationDepartementNature,
  foreignKey: "idnature",
  otherKey: "iddepartement",
});

EnteteDemande.hasMany(LigneDemande, {
  foreignKey: "iddemande",
  as: "lignes",
});

LigneDemande.belongsTo(EnteteDemande, {
  foreignKey: "iddemande",
  as: "demande",
});

LigneDemande.belongsTo(NatureOperation, {
  foreignKey: "idnature",
  as: "nature",
});

Departement.hasMany(EnteteDemande, {
  foreignKey: "iddepartement",
  as: "demandes",
});

EnteteDemande.belongsTo(Departement, {
  foreignKey: "iddepartement",
  as: "departement",
});

module.exports = {
  sequelize,
  Departement,
  NatureOperation,
  AffectationDepartementNature,
  EnteteDemande,
  LigneDemande,
};