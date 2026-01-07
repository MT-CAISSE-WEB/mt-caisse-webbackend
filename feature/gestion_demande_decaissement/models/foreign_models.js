const { DataTypes } = require('sequelize')
const sequelize = require('../../../config/database')

module.exports.Utilisateur = sequelize.define(
  'Utilisateur',
  {
    idutilisateur: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    codeutilisateur: {
      type: DataTypes.STRING(24),
      unique: true,
    },
    nom: DataTypes.STRING(100),
    prenom: DataTypes.STRING(100),
    adresse: DataTypes.STRING(100),
    telephone: DataTypes.STRING(50),
    email: DataTypes.STRING(50),
    typeentitesite: { type: DataTypes.INTEGER, defaultValue: 0 },
    typeentitedepartement: { type: DataTypes.INTEGER, defaultValue: 0 },
    typeentitesociete: { type: DataTypes.INTEGER, defaultValue: 0 },
    acheteur: { type: DataTypes.INTEGER, defaultValue: 0 },
    iddepartement: DataTypes.UUID,
    idsociete: DataTypes.UUID,
    idsite: DataTypes.UUID,
    login: {
      type: DataTypes.STRING(50),
      unique: true,
    },
    password: DataTypes.STRING(50),
    createdat: DataTypes.DATE,
    createdby: DataTypes.STRING(50),
    updatedat: DataTypes.DATE,
    updatedby: DataTypes.STRING(50),
  },
  {
    tableName: 'Utilisateur',
    timestamps: false,
  }
)

module.exports.CircuitValidation = sequelize.define(
  'CircuitValidation',
  {
    idcircuitvalidation: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    codecircuitvalidation: { type: DataTypes.STRING(24), unique: true },
    idsociete: DataTypes.UUID,
    idsite: DataTypes.UUID,
    // codesite: DataTypes.STRING(50),
    typeentite: DataTypes.STRING(100),
    typeaction: DataTypes.STRING(100),
    // iddepartement: DataTypes.UUID,
    // nombrevalidateur: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    // },
    actif: { type: DataTypes.INTEGER, defaultValue: 1 },
    createdat: DataTypes.DATE,
    createdby: DataTypes.STRING(50),
    updatedat: DataTypes.DATE,
    updatedby: DataTypes.STRING(50),
  },
  {
    tableName: 'CircuitValidation',
    timestamps: false,
  }
)

module.exports.Departement = sequelize.define(
  'Departement',
  {
    iddepartement: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    idsociete: DataTypes.UUID,
    idsite: DataTypes.UUID,
    responsable: DataTypes.UUID,
    codedept: { type: DataTypes.STRING(50), unique: true },
    libelle: DataTypes.STRING(150),
    email: DataTypes.STRING(30),
    telephone: DataTypes.STRING(20),
    adresse: DataTypes.STRING(200),
    createdat: DataTypes.DATE,
    createdby: DataTypes.STRING(50),
    updatedat: DataTypes.DATE,
    updatedby: DataTypes.STRING(50),
  },
  {
    tableName: 'Departement',
    timestamps: false,
  }
)

module.exports.Site = sequelize.define(
  'Site',
  {
    idsite: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    idsociete: DataTypes.UUID,
    idcentreanalytique: DataTypes.UUID,
    codesite: { type: DataTypes.STRING(50), unique: true },
    libelle: DataTypes.STRING(150),
    email: DataTypes.STRING(30),
    telephone: DataTypes.STRING(20),
    adresse: DataTypes.STRING(200),
    estcentreanalytique: { type: DataTypes.INTEGER, defaultValue: 0 },
    createdat: DataTypes.DATE,
    createdby: DataTypes.STRING(50),
    updatedat: DataTypes.DATE,
    updatedby: DataTypes.STRING(50),
  },
  {
    tableName: 'Site',
    timestamps: false,
  }
)

module.exports.Societe = sequelize.define(
  'Societe',
  {
    idsociete: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    codesociete: { type: DataTypes.STRING(50), unique: true },
    iddevisereference: DataTypes.UUID,
    iddevisereporting: DataTypes.UUID,
    raisonsociale: DataTypes.STRING(150),
    sigle: DataTypes.STRING(50),
    rccm: DataTypes.STRING(50),
    numnui: DataTypes.STRING(50),
    email: DataTypes.STRING(30),
    telephone: DataTypes.STRING(20),
    logo: DataTypes.STRING(50),
    adresse: DataTypes.STRING(200),
    suivibudgetaire: { type: DataTypes.INTEGER, defaultValue: 0 },
    createdat: DataTypes.DATE,
    createdby: DataTypes.STRING(50),
    updatedat: DataTypes.DATE,
    updatedby: DataTypes.STRING(50),
  },
  {
    tableName: 'Societe',
    timestamps: false,
  }
)

module.exports.Devise = sequelize.define(
  'Devise',
  {
    iddevise: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    codedevise: { type: DataTypes.STRING(3), unique: true },
    intitule: DataTypes.STRING(150),
    codeiso: DataTypes.STRING(150),
    actif: { type: DataTypes.INTEGER, defaultValue: 0 },
    createdat: DataTypes.DATE,
    createdby: DataTypes.STRING(50),
    updatedat: DataTypes.DATE,
    updatedby: DataTypes.STRING(50),
  },
  {
    tableName: 'Devise',
    timestamps: false,
  }
)

module.exports.CentreAnalytique = sequelize.define(
  'CentreAnalytique',
  {
    idcentreanalytique: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    idsociete: DataTypes.UUID,
    codecentreanalytique: { type: DataTypes.STRING(50), unique: true },
    libelle: DataTypes.STRING(150),
    actif: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createdat: DataTypes.DATE,
    createdby: DataTypes.STRING(50),
    updatedat: DataTypes.DATE,
    updatedby: DataTypes.STRING(50),
  },
  {
    tableName: 'CentreAnalytique',
    timestamps: false,
  }
)

module.exports.NatureOperation = sequelize.define(
  'NatureOperation',
  {
    idnature: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    codenature: { type: DataTypes.STRING(50), unique: true },
    idsociete: DataTypes.UUID,
    codesociete: DataTypes.STRING(50),
    idcompte: DataTypes.UUID,
    numcompte: DataTypes.STRING(50),
    libelle: DataTypes.STRING(150),
    avanceajustifier: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    imputationtiers: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    actif: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    demandedecaissement: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createdat: DataTypes.DATE,
    createdby: DataTypes.STRING(50),
    updatedat: DataTypes.DATE,
    updatedby: DataTypes.STRING(50),
  },
  {
    tableName: 'NatureOperation',
    timestamps: false,
  }
)
