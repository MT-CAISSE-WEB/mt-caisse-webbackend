const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const DemandePieceJointe = sequelize.define(
  "DemandePieceJointe",
  {
    iddemandepiecejointe: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    iddemande: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    idpiecejointe: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "DemandePieceJointe",
    timestamps: false,
  },
);

module.exports = DemandePieceJointe;
