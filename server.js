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


//DECLARATION DES ROUTES
// Journal routes
const journalRoutes = require("./feature/gestion_operation_caisse/routes/journal.route");
// Caisse routes
const caisseRoutes = require("./feature/gestion_operation_caisse/routes/caisse.route");
// Utilisateur caisse routes
const utilisateurcaisseRoutes = require("./feature/gestion_operation_caisse/routes/utilisateurcaisse.route");
// Entete operation routes
const enteteoperationRoutes = require("./feature/gestion_operation_caisse/routes/enteteoperation.route");
// Ligne operation routes
const ligneoperationRoutes = require("./feature/gestion_operation_caisse/routes/ligneoperation.route");
// Type operation routes
const typeoperationRoutes = require("./feature/gestion_operation_caisse/routes/operation.route");
// Budget
const budget_route = require('./feature/gestion_budget/routes/budget.route')
// Ligne budgetaire
const ligne_budgetaire_route = require('./feature/gestion_budget/routes/lignebudget.route')
// Devise routes
const deviseroute = require('./feature/gestion_organisation/routes/devise.route');
// Taux de devise routes
const tauxdeviseroute = require('./feature/gestion_organisation/routes/tauxdevise.route');
// Societe routes
const societeroute = require('./feature/gestion_organisation/routes/societe.route');
// Site routes
const siteroute = require('./feature/gestion_organisation/routes/site.route');
// Département routes
const departementroute = require('./feature/gestion_organisation/routes/departement.route');


//connexion db
const {connectInstance} = require('./config/db')

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

//LANCEMENT DE LA BASE DE DONNEES
connectInstance()

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
//GESTION OPERATION CAISSE ROUTES
app.use("/API/journal", journalRoutes);
app.use("/API/caisse", caisseRoutes);
app.use("/API/utilisateur_caisse", utilisateurcaisseRoutes);
app.use("/API/entete_operation", enteteoperationRoutes);
app.use("/API/ligne_operation", ligneoperationRoutes);
app.use("/API/operation", typeoperationRoutes);
//Budget
app.use('/API/budget', budget_route)
//Ligne budgetaire
app.use('/API/ligne-budgetaire', ligne_budgetaire_route)
//API
app.use('/API',deviseroute);
app.use('/API',tauxdeviseroute);
app.use('/API',societeroute);
app.use('/API',siteroute);
app.use('/API',departementroute);

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


