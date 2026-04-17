const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

// Import des autres modèles
const Budget = sequelize.define(
  "Budget",
  {
    idbudget: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    codebudget: { type: DataTypes.STRING(24), unique: true },
    libelle: DataTypes.STRING(100),
    idbudgetparent: DataTypes.UUID,
    typebudget: DataTypes.STRING(10),
    entite: DataTypes.STRING(20),
    datedebut: DataTypes.DATE,
    datefin: DataTypes.DATE,
    actif: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isanalytique: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    cloture: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    valide: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    idcircuitvalidation: DataTypes.UUID,
    dernierniveau: DataTypes.INTEGER,
    niveauactuel: DataTypes.INTEGER,
    validedept: DataTypes.INTEGER,
    datevalidedept: DataTypes.DATE,
    validesite: DataTypes.INTEGER,
    datevalidesite: DataTypes.DATE,
    validesociete: DataTypes.INTEGER,
    datevalidesociete: DataTypes.DATE,
    idsite: DataTypes.UUID,
    idsociete: DataTypes.UUID,
    createdat: DataTypes.DATE,
    createdby: DataTypes.STRING(50),
    updatedat: DataTypes.DATE,
    updatedby: DataTypes.STRING(50),
  },
  {
    tableName: "Budget",
    timestamps: false,
  },
);

// ===== Associations =====

module.exports = Budget;
