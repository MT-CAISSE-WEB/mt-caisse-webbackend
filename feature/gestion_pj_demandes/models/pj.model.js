const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const PieceJointe = sequelize.define(
  "PieceJointe",
  {
    idpiecejointe: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    urlpiece: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    nomfichier: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    taille: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    mimetype: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "mimetype", // Assurez-vous que le champ s'appelle "mimetype" dans la base de données
    },

    dossier: {
      type: DataTypes.STRING(100),
    },
  },
  {
    tableName: "PieceJointe",
    timestamps: false,
  },
);

module.exports = PieceJointe;