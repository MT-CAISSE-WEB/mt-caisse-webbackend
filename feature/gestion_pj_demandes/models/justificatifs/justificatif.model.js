const { DataTypes, NOW } = require("sequelize");
const sequelize = require("../../../../config/database");

const JustificatifOperation = sequelize.define(
    "JustificatifOperation",
    {
        idjustificatifoperation: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        codejustificatif: {
            type: DataTypes.STRING,
            unique: true
        },

        idoperation: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        iddevise: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        taux: {
            type: DataTypes.DECIMAL(22, 9)
        },
        tauxinverse: {
            type: DataTypes.DECIMAL(22, 9)
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: NOW()
        },
        montantjustificatif: {
            type: DataTypes.DECIMAL(22, 9)
        },
        commentaire: {
            type: DataTypes.STRING
        }
    },
    {
        tableName: "JustificatifOperation",
        timestamps: false,
    },
);

module.exports = JustificatifOperation;