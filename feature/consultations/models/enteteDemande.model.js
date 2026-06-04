const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");
const {
  Departement,
} = require("../../gestion_demande_decaissement/models/foreign_models");

const EnteteDemande = sequelize.define(
  "EnteteDemande",
  {
    iddemande: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    codedemande: {
      type: DataTypes.STRING(50),
      unique: true,
    },
    iddemandeur: DataTypes.UUID,
    typedemande: DataTypes.STRING(50),
    libelledemande: DataTypes.STRING(200),
    datedemande: DataTypes.DATE,
    decaisse: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    solde: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    statut: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    niveauactuel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    taux: DataTypes.DECIMAL(22, 9),
    idcircuit: DataTypes.UUID,
    idsociete: DataTypes.UUID,
    idsite: DataTypes.UUID,
    iddepartement: DataTypes.UUID,
    iddevise: DataTypes.UUID,
    createdat: DataTypes.DATE,
    createdby: DataTypes.STRING(50),
    updatedat: DataTypes.DATE,
    updatedby: DataTypes.STRING(50),
  },
  {
    tableName: "EnteteDemande",
    timestamps: false,
  },
);

// // Entête -> Département
// EnteteDemande.belongsTo(Departement, {
//   foreignKey: "iddepartement",
//   as: "departement",
// });

// EnteteDemande.hasMany(LigneDemande, {
//   foreignKey: "iddemande",
//   as: "lignes",
//   onDelete: "CASCADE",
// });

module.exports = EnteteDemande;
