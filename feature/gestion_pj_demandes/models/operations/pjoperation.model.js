const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

const OperationPieceJointe = sequelize.define(
  "OperationPieceJointe",
  {
    idoperationpiecejointe: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    idoperation: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    idpiecejointe: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "OperationPieceJointe",
    timestamps: false,
  },
);

module.exports = OperationPieceJointe;