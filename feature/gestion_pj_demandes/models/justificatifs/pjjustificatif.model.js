const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

const JustificatifPieceJointe = sequelize.define(
  "JustificatifPieceJointe",
  {
    idjustificatifpiecejointe: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    idjustificatifoperation: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    idpiecejointe: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "JustificatifPieceJointe",
    timestamps: false,
  },
);

module.exports = JustificatifPieceJointe;