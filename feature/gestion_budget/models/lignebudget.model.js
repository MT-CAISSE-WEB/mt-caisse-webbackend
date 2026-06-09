const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

// Import des autres modèles
const {
  Departement,
  NatureOperation,
  CentreAnalytique,
} = require("../../gestion_demande_decaissement/models/foreign_models");

const { Budget } = require("../models/index");

const BudgetDepartementNature = sequelize.define(
  "BudgetDepartementNature",
  {
    idbudgetdepartementnature: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    codebudgetaire: {
      type: DataTypes.STRING(8),
      unique: true,
    },
    idbudget: DataTypes.UUID,
    iddepartement: DataTypes.UUID,
    idnature: DataTypes.UUID,
    idcentreanalytique: DataTypes.UUID,
    montantprevisiondept: DataTypes.DECIMAL(22, 9),
    montantprevisionsite: DataTypes.DECIMAL(22, 9),
    montantprevisionsociete: DataTypes.DECIMAL(22, 9),
    totalconsocloture: DataTypes.DECIMAL(22, 9),
    soldecloture: DataTypes.DECIMAL(22, 9),
    createdat: DataTypes.DATE,
    createdby: DataTypes.STRING(50),
    updatedat: DataTypes.DATE,
    updatedby: DataTypes.STRING(50),
  },
  {
    tableName: "BudgetDepartementNature",
    timestamps: false,
  },
);

// ===== Associations =====

// Budget
BudgetDepartementNature.belongsTo(Budget, {
  foreignKey: "idbudget",
  as: "budget",
});

// Département
BudgetDepartementNature.belongsTo(Departement, {
  foreignKey: "iddepartement",
  as: "departement",
});

// Société
BudgetDepartementNature.belongsTo(NatureOperation, {
  foreignKey: "idnature",
  as: "nature_operation",
});

// Centre analytique
BudgetDepartementNature.belongsTo(CentreAnalytique, {
  foreignKey: "idcentreanalytique",
  as: "centre_analytique",
});

module.exports = BudgetDepartementNature;