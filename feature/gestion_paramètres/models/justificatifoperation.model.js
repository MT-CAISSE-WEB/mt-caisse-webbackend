const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const JustificatifOperation = sequelize.define(
  "JustificatifOperation",
  {
    idjustificatifoperation: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    codejustificatif: {
      type: DataTypes.STRING(24),
      unique: true,
      allowNull: false,
    },

    idoperation: {
      type: DataTypes.UUID,
    },

    iddevise: {
      type: DataTypes.UUID,
    },

    taux: {
      type: DataTypes.DECIMAL(22, 9),
    },

    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },

    montantjustificatif: {
      type: DataTypes.DECIMAL(22, 9),
      allowNull: false,
    },

    commentaire: {
      type: DataTypes.STRING(255),
    },
    tauxinverse: {
      type: DataTypes.DECIMAL(22, 9),
    },
    createdat: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createdby: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    updatedat: DataTypes.DATE,
    updatedby: DataTypes.STRING,
  },
  {
    tableName: "JustificatifOperation",
    timestamps: false,
  },
);

module.exports = JustificatifOperation;
