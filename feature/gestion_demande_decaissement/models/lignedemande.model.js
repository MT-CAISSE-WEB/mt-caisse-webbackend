const { DataTypes } = require('sequelize')
const sequelize = require('../../../config/database')

// Import des autres modèles
const {
  Site,
  Societe,
  CentreAnalytique,
  NatureOperation,
} = require('./foreign_models')
const EnteteDemande = require('./entetedemande.model')
const Budget = require('../../gestion_budget/models/budget.model')

const LigneDemande = sequelize.define(
  'LigneDemande',
  {
    idlignedemande: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    iddemande: DataTypes.UUID,
    numligne: {
      type: DataTypes.INTEGER,
      unique: true,
    },
    libellelignedemande: DataTypes.STRING(255),
    montantdemande: DataTypes.DECIMAL(10, 2),
    idnature: DataTypes.UUID,
    idbudget: DataTypes.UUID,
    idcentre: DataTypes.UUID,
    idsociete: DataTypes.UUID,
    idsite: DataTypes.UUID,
    createdat: DataTypes.DATE,
    createdby: DataTypes.STRING(50),
    updatedat: DataTypes.DATE,
    updatedby: DataTypes.STRING(50),
  },
  {
    tableName: 'LigneDemande',
    timestamps: false,
  }
)

// ===== Associations =====

// Budget
LigneDemande.belongsTo(Budget, {
  foreignKey: 'idbudget',
  as: 'budget',
})

// Entete de la demande
LigneDemande.belongsTo(EnteteDemande, {
  foreignKey: 'iddemande',
  as: 'entete',
})

// Société
LigneDemande.belongsTo(Societe, {
  foreignKey: 'idsociete',
  as: 'societe',
})

// Site
LigneDemande.belongsTo(Site, {
  foreignKey: 'idsite',
  as: 'site',
})

// Centre Analytique
LigneDemande.belongsTo(CentreAnalytique, {
  foreignKey: 'idcentre',
  as: 'centre_analytique',
})

// Devise
LigneDemande.belongsTo(NatureOperation, {
  foreignKey: 'idnature',
  as: 'nature_operation',
})

module.exports = LigneDemande
