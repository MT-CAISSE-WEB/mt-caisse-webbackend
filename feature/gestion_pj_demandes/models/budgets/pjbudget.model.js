const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

const BudgetPieceJointe = sequelize.define(
  "BudgetPieceJointe",
  {
    idbudgetpiecejointe: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    idbudget: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    idpiecejointe: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "BudgetPieceJointe",
    timestamps: false,
  },
);

module.exports = BudgetPieceJointe;