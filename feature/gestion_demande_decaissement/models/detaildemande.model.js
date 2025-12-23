const { DataTypes } = require('sequelize')
const sequelize = require('../../../config/database')

// Import des autres modèles
const { Societe } = require('./foreign_models')
const LigneDemande = require('./lignedemande.model')
const EnteteDemande = require('./entetedemande.model')

const DetailsDemande = sequelize.define(
  'DetailsDemande',
  {
    iddetailsdemande: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    iddemande: DataTypes.UUID,
    idlignedemande: DataTypes.UUID,
    idsociete: DataTypes.UUID,
    description: DataTypes.STRING(255),
    quantite: DataTypes.DECIMAL(22, 9),
    montant: DataTypes.DECIMAL(22, 9),
    createdat: DataTypes.DATE,
    createdby: DataTypes.STRING(50),
    updatedat: DataTypes.DATE,
    updatedby: DataTypes.STRING(50),
  },
  {
    tableName: 'DetailsDemande',
    timestamps: false,
  }
)

// ===== Associations =====

// Entete de la demande
DetailsDemande.belongsTo(EnteteDemande, {
  foreignKey: 'iddemande',
  as: 'entete',
})

// Société
DetailsDemande.belongsTo(Societe, {
  foreignKey: 'idsociete',
  as: 'societe',
})

// Ligne demande
DetailsDemande.belongsTo(LigneDemande, {
  foreignKey: 'idlignedemande',
  as: 'ligne_demande',
})

module.exports = DetailsDemande
