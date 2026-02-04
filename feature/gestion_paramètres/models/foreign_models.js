const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

module.exports.Devise = sequelize.define(
  "Devise",
  {
    iddevise: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    codedevise: DataTypes.STRING,
    intitule: DataTypes.STRING,
  },
  {
    tableName: "Devise",
    timestamps: false,
  }
);

module.exports.EnteteOperationCaisse = sequelize.define(
  "EnteteOperationCaisse",
  {
    idoperation: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    codeoperation: DataTypes.STRING,
    montant: DataTypes.DECIMAL,
  },
  {
    tableName: "EnteteOperationCaisse",
    timestamps: false,
  }
);

module.exports.NatureOperation = sequelize.define(
  "NatureOperation",
  {
    idnature: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    codenature: DataTypes.STRING,
    libelle: DataTypes.STRING,
  },
  {
    tableName: "NatureOperation",
    timestamps: false,
  }
);

module.exports.CentreAnalytique = sequelize.define(
  "CentreAnalytique",
  {
    idcentreanalytique: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    codecentreanalytique: DataTypes.STRING,
    libelle: DataTypes.STRING,
  },
  {
    tableName: "CentreAnalytique",
    timestamps: false,
  }
);

module.exports.Tiers = sequelize.define(
  "Tiers",
  {
    idtiers: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    codetiers: DataTypes.STRING,
    designation: DataTypes.STRING,
  },
  {
    tableName: "Tiers",
    timestamps: false,
  }
);

module.exports.TypeOperation = sequelize.define(
  "TypeOperation",
  {
    idtypeoperation: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    codtypeoperation: DataTypes.STRING(50),
    idoperation: DataTypes.UUID,
    idperiode: DataTypes.UUID,
    idsociete: DataTypes.UUID,
    idsite: DataTypes.UUID,
    idcaisse: DataTypes.UUID,
    montant: DataTypes.DECIMAL(21, 9),
    taux: DataTypes.DECIMAL(18, 13),
    montantref: DataTypes.DECIMAL(21, 9),
    createdat: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createdby: DataTypes.STRING(50),
    updatedat: DataTypes.DATE,
    updatedby: DataTypes.STRING(50),
  },
  {
    tableName: "TypeOperation",
    timestamps: false,
  }
);