const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

const EnteteOperationCaisse = sequelize.define(
  "EnteteOperationCaisse",
  {
    idoperation: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    codeoperation: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    iddemande: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    idsociete: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    idsite: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    iddevise: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    idoperationorigine: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    idoperationannulation: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    dateoperation: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    montant: {
      type: DataTypes.DECIMAL(22, 9),
      allowNull: false,
      defaultValue: 0,
    },

    tauxoperation: {
      type: DataTypes.DECIMAL(22, 9),
      allowNull: false,
      defaultValue: 1,
    },

    typeoperation: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    beneficiaire: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    justifiee: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    annulee: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    createdat: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    createdby: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    updatedat: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    updatedby: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: "EnteteOperationCaisse",
    timestamps: false,
  },
);

module.exports = EnteteOperationCaisse;
