// models/validationbudget.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const ValidationBudget = sequelize.define(
  "ValidationBudget",
  {
    idvalidationbudget: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: "idvalidationbudget",
    },
    idbudget: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "idbudget",
      references: {
        model: "Budget",
        key: "idbudget",
      },
    },
    idcircuitvalidation: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "idcircuitvalidation",
      references: {
        model: "CircuitValidation",
        key: "idcircuitvalidation",
      },
    },
    idcircuitetape: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "idcircuitetape",
      references: {
        model: "Circuitetape",
        key: "idcircuitetape",
      },
    },
    idutilisateur: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "idutilisateur",
      references: {
        model: "Utilisateur",
        key: "idutilisateur",
      },
    },
    idmotif: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "idmotif",
      references: {
        model: "Motif",
        key: "idmotif",
      },
    },
    decision: {
      type: DataTypes.ENUM("APPROUVE", "REJETE", "EN_ATTENTE"),
      allowNull: true,
      field: "decision",
      validate: {
        isIn: [["APPROUVE", "REJETE", "EN_ATTENTE"]],
      },
    },
    commentaire: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "commentaire",
      validate: {
        len: {
          args: [0, 255],
          msg: "Le commentaire ne peut pas dépasser 255 caractères",
        },
      },
    },
    datevalidation: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "datevalidation",
    },
    rang: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "rang",
      defaultValue: null,
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: "createdat",
    },
    createdby: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "createdby",
    },
  },
  {
    tableName: "ValidationBudget",
    timestamps: false, // Car nous utilisons createdat manuellement
    underscored: false,
    // Si vous voulez des timestamps automatiques Sequelize
    // timestamps: true,
    // createdAt: 'createdat',
    // updatedAt: false
  },
);

module.exports = ValidationBudget;