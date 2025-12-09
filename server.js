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
const deviseroute = require('./feature/gestion_organisation/routes/devise.route');
const tauxdeviseroute = require('./feature/gestion_organisation/routes/tauxdevise.route');
const societeroute = require('./feature/gestion_organisation/routes/societe.route');
const siteroute = require('./feature/gestion_organisation/routes/site.route');
const departementroute = require('./feature/gestion_organisation/routes/departement.route');
// Tiers routes
const tiersroutes = require("./feature/gestion_donnee_base/routes/tiers.route");
// Plan comptable routes
const plancomptableroutes = require("./feature/gestion_donnee_base/routes/plancomptable.route");
// Nature opérations routes
const natureoperationroutes = require("./feature/gestion_donnee_base/routes/natureoperation.route");
// Centre analytiques routes
const centreanalytiqueroutes = require("./feature/gestion_donnee_base/routes/centreanalytique.route");
// Affectation analytiques routes
const affectationanalytiqueroutes = require("./feature/gestion_donnee_base/routes/affectationanalytique.route");
// Routes users
const userroute = require('./feature/gestion_users/routes/users.route');

const db = require('./config/db');

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
//Budget
app.use('/api/budget', budget_route)
//Ligne budgetaire
app.use('/api/ligne-budgetaire', ligne_budgetaire_route)
//Entete demande
app.use('/api/entete-demande', entete_demande_route)
//Ligne demande
app.use('/api/ligne-demande', ligne_demande_route)
//Details demande
app.use('/api/details-demande', details_demande_route)

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
// Gestion donnee de base
app.use("/API/tiers", tiersroutes);
app.use("/API/plancomptable", plancomptableroutes);
app.use("/API/natureoperation", natureoperationroutes);
app.use("/API/centreanalytique", centreanalytiqueroutes);
app.use("/API/affectationanalytique", affectationanalytiqueroutes);
// Gestion des users
app.use('/API',userroute);


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
