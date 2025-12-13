const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const device = require('express-device');
const bodyParser = require('body-parser');
const logger = require('./shared/middlewares/logger');
const errorHandler = require('./shared/middlewares/error');


const deviseroute = require('./feature/gestion_organisation/routes/devise.route');
const tauxdeviseroute = require('./feature/gestion_organisation/routes/tauxdevise.route');
const societeroute = require('./feature/gestion_organisation/routes/societe.route');
const siteroute = require('./feature/gestion_organisation/routes/site.route');
const departementroute = require('./feature/gestion_organisation/routes/departement.route');
const userroute = require('./feature/gestion_users/routes/users.route');
const roleroute = require('./feature/gestion_users/routes/role.route');
const permissionroute = require('./feature/gestion_users/routes/permission.route');
const rolepermissionroute = require('./feature/gestion_users/routes/role_permission.route');

const db = require('./config/db');

dotenv.config({path: './config/config.env'});
// INIT EXPRESS
const app = express();
// ANALYSEUR DE CORPS DE REQ AU FORMAT JSON
app.use(express.json());
// TRAITER DES REQ EXTERIEUR
app.use(cors());
// GET INFO DEVICE
app.use(device.capture());

// DOSSIER FICHIER STATIQUE
global.appRoot = path.resolve(__dirname);
app.use(express.static(path.join(__dirname, 'public')));

// ACTIVE MIDDLEWARE DE JOURNALISATION
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

db.initdatabase();
//db.connectInstance();



// JOURNALISATION PERSONNALISEE
app.use(logger);

// Middleware pour parser les données des requêtes POST
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de session
app.use(session({
    secret: 'votre_secret_de_session',
    resave: false,
    saveUninitialized: true,
}));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Définir le répertoire des vues
app.set('views', path.join(__dirname, 'views'));

//Regrouper toutes les routes

console.log("PORT", process.env.PORT);
console.log("TEXT", process.env.text);

// GESTION DES ERREURS 
app.use(errorHandler);
// PORT DEFINI OU PORT PAR DEFAUT 7000
const PORT = process.env.PORT || 7000;
// LANCEMENT DU SERVEUR
const server = app.listen(
    PORT,
    console.log(`Serveur lancer en mode ${process.env.NODE_ENV} sur le port ${PORT}`.yellow.bold)
);

//API
app.use('/API',deviseroute);
app.use('/API',tauxdeviseroute);
app.use('/API',societeroute);
app.use('/API',siteroute);
app.use('/API',departementroute);
app.use('/API',userroute);
app.use('/API',roleroute);
app.use('/API',permissionroute);
app.use('/API',rolepermissionroute);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & exit process
    server.close(() => process.exit(1));
});