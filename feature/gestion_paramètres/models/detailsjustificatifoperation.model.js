const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const DetailsJustificatifOperation = sequelize.define(
  "DetailsJustificatifOperation",
  {
    iddetailsjustificatifoperation: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    idjustificatif: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    idnature: {
      type: DataTypes.UUID
    },

    idcentreanalytique: {
      type: DataTypes.UUID
    },

    idtiers: {
      type: DataTypes.UUID
    },

    montantdetail: {
      type: DataTypes.DECIMAL(22, 9),
    },

    montantref: {
      type: DataTypes.DECIMAL(22, 9),
    },

    createdat: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    createdby: DataTypes.STRING,
    updatedat: DataTypes.DATE,
    updatedby: DataTypes.STRING
  },
  {
    tableName: "DetailsJustificatifOperation",
    timestamps: false,
  }
);

module.exports = DetailsJustificatifOperation;
