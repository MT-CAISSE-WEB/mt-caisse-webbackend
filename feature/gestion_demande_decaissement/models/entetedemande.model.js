const { DataTypes } = require('sequelize')
const sequelize = require('../../../config/database')

// Import des autres modèles
const {
  CircuitValidation,
  Departement,
  Site,
  Societe,
  Utilisateur,
  Devise,
} = require('./foreign_models')

const EnteteDemande = sequelize.define(
  'EnteteDemande',
  {
    iddemande: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    codedemande: { type: DataTypes.STRING(50), unique: true },
    iddemandeur: DataTypes.UUID,
    typedemande: DataTypes.STRING(50),
    libelledemande: DataTypes.STRING(200),
    datedemande: DataTypes.DATE,
    decaisse: { type: DataTypes.INTEGER, defaultValue: 0 },
    solde: { type: DataTypes.INTEGER, defaultValue: 0 },
    statut: DataTypes.STRING(50),
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
    tableName: 'EnteteDemande',
    timestamps: false,
  }
)

// ===== Associations =====

// Demandeur
EnteteDemande.belongsTo(Utilisateur, {
  foreignKey: 'iddemandeur',
  as: 'demandeur',
})

// Circuit de validation
EnteteDemande.belongsTo(CircuitValidation, {
  foreignKey: 'idcircuit',
  as: 'circuit',
})

// Société
EnteteDemande.belongsTo(Societe, {
  foreignKey: 'idsociete',
  as: 'societe',
})

// Site
EnteteDemande.belongsTo(Site, {
  foreignKey: 'idsite',
  as: 'site',
})

// Département
EnteteDemande.belongsTo(Departement, {
  foreignKey: 'iddepartement',
  as: 'departement',
})

// Devise
EnteteDemande.belongsTo(Devise, {
  foreignKey: 'iddevise',
  as: 'devise',
})

module.exports = EnteteDemande
