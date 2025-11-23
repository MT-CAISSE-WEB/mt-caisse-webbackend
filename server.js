const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const colors = require('colors')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const session = require('express-session')
const device = require('express-device')
const bodyParser = require('body-parser')
const logger = require('./shared/middlewares/logger')
const errorHandler = require('./shared/middlewares/error')

// Declaration des routes
const societesroutes = require("./feature/gestion_organisation/routes/societe.route");


//connexion db
const db = require('./config/db')

dotenv.config({ path: './config/config.env' })
// INIT EXPRESS
const app = express()
// ANALYSEUR DE CORPS DE REQ AU FORMAT JSON
app.use(express.json())
// TRAITER DES REQ EXTERIEUR
app.use(cors())
// GET INFO DEVICE
app.use(device.capture())

// DOSSIER FICHIER STATIQUE
global.appRoot = path.resolve(__dirname)
app.use(express.static(path.join(__dirname, 'public')))

// ACTIVE MIDDLEWARE DE JOURNALISATION
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

db.connectInstance()

// JOURNALISATION PERSONNALISEE
app.use(logger)

// Middleware pour parser les données des requêtes POST
app.use(bodyParser.urlencoded({ extended: true }))

// Middleware de session
app.use(
  session({
    secret: 'votre_secret_de_session',
    resave: false,
    saveUninitialized: true,
  })
)

// Set EJS as the view engine
app.set('view engine', 'ejs')

// Définir le répertoire des vues
app.set('views', path.join(__dirname, 'views'))

//Regrouper toutes les routes
app.use("/API/societe", societesroutes);

// GESTION DES ERREURS
app.use(errorHandler)
// PORT DEFINI OU PORT PAR DEFAUT 7000
const PORT = process.env.PORT || 7000
// LANCEMENT DU SERVEUR
const server = app.listen(
  PORT,
  console.log(
    `Serveur lancer en mode ${process.env.NODE_ENV} sur le port ${PORT}`.yellow
      .bold
  )
)

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red)
  // Close server & exit process
  server.close(() => process.exit(1))
})
