const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");
const {
  NatureOperation,
  CentreAnalytique,
} = require("../../gestion_demande_decaissement/models/foreign_models");
const Budget = require("../../gestion_budget/models/budget.model");
const EnteteDemande = require("./enteteDemande.model");

const LigneDemande = sequelize.define(
  "LigneDemande",
  {
    idlignedemande: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    iddemande: DataTypes.UUID,
    numligne: DataTypes.INTEGER,
    libellelignedemande: DataTypes.STRING(255),
    montantdemande: DataTypes.DECIMAL(22, 9),
    budgetconso: DataTypes.DECIMAL(22, 9),
    preengage: DataTypes.DECIMAL(22, 9),
    engage: DataTypes.DECIMAL(22, 9),
    realise: DataTypes.DECIMAL(22, 9),
    idnature: DataTypes.UUID,
    idbudget: DataTypes.UUID,
    idcentre: DataTypes.UUID,
    idtiers: DataTypes.UUID,
    idsociete: DataTypes.UUID,
    idsite: DataTypes.UUID,
    createdat: DataTypes.DATE,
    createdby: DataTypes.STRING(50),
    updatedat: DataTypes.DATE,
    updatedby: DataTypes.STRING(50),
  },
  {
    tableName: "LigneDemande",
    timestamps: false,
  },
);

// Ligne -> Entête
// LigneDemande.belongsTo(EnteteDemande, {
//   foreignKey: "iddemande",
//   as: "demande",
// });

// // Ligne -> Nature
// LigneDemande.belongsTo(NatureOperation, {
//   foreignKey: "idnature",
//   as: "nature",
// });

// // Ligne -> Budget
// LigneDemande.belongsTo(Budget, {
//   foreignKey: "idbudget",
//   as: "budget",
// });

// // Ligne -> Centre analytique
// LigneDemande.belongsTo(CentreAnalytique, {
//   foreignKey: "idcentre",
//   as: "centre",
// });

module.exports = LigneDemande;
