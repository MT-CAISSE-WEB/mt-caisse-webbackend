const dotenv = require('dotenv')
dotenv.config({ path: './config/config.env' })
const { Sequelize } = require('sequelize')

// Patch pour forcer le format sans timezone
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  date = this._applyTimezone(date, options)
  return date.format('YYYY-MM-DD HH:mm:ss.SSS') // sans le fuseau horaire
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_SERVER,
    dialect: 'mssql',
    dialectModule: require('tedious'),
    logging: false,
    dialectOptions: {
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: true,
      },
    },
  }
)

module.exports = sequelize
