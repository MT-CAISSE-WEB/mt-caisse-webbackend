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
const sequelize = require('./config/database')

// Organisation routes
const deviseroute = require('./feature/gestion_organisation/routes/devise.route');
const tauxdeviseroute = require('./feature/gestion_organisation/routes/tauxdevise.route');
const societeroute = require('./feature/gestion_organisation/routes/societe.route');
const siteroute = require('./feature/gestion_organisation/routes/site.route');
const departementroute = require('./feature/gestion_organisation/routes/departement.route');
const userroute = require('./feature/gestion_users/routes/users.route');
const roleroute = require('./feature/gestion_users/routes/role.route');
const permissionroute = require('./feature/gestion_users/routes/permission.route');
const rolepermissionroute = require('./feature/gestion_users/routes/role_permission.route');
const utilisateur_role = require('./feature/gestion_users/routes/utilisateur_role.route');
const utilisateurdept = require('./feature/gestion_users/routes/usersdepartement.route');

// Tiers routes
const tiersroutes = require("./feature/gestion_donnee_base/routes/tiers.route");
const plancomptableroutes = require("./feature/gestion_donnee_base/routes/plancomptable.route");
const natureoperationroutes = require("./feature/gestion_donnee_base/routes/natureoperation.route");
const centreanalytiqueroutes = require("./feature/gestion_donnee_base/routes/centreanalytique.route");
const affectationanalytiqueroutes = require("./feature/gestion_donnee_base/routes/affectationanalytique.route");
const affnaturecentreroutes = require("./feature/gestion_donnee_base/routes/affectationnaturecentre.route");
const affdepartementnatureroutes = require("./feature/gestion_donnee_base/routes/affectationdeptnature.route");



// Budget
const budget_route = require('./feature/gestion_budget/routes/budget.route')
// Ligne budgetaire
const ligne_budgetaire_route = require('./feature/gestion_budget/routes/lignebudget.route')
// Entete demande
const entete_demande_route = require('./feature/gestion_demande_decaissement/routes/entetedemande.route')
// Ligne demande
const ligne_demande_route = require('./feature/gestion_demande_decaissement/routes/ligendemande.route')
// Détails demande
const details_demande_route = require('./feature/gestion_demande_decaissement/routes/detaildemande.route')
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
// Declaration des routes
//const societesroutes = require("./feature/gestion_workflow/routes/circuitvalidateur.route");
const circuitvalidateurroute = require("./feature/gestion_workflow/routes/circuitvalidateur.route");
const circuitvalidationroute = require("./feature/gestion_workflow/routes/circuitvalidation.route");
const circuitetaperoute = require("./feature/gestion_workflow/routes/circuitetape.route");
const etapevalidateurroute = require("./feature/gestion_workflow/routes/etapevalidateur.route");
const validationdemanderoute = require("./feature/gestion_workflow/routes/validationdemande.route");

// Declaration des routes pour les consultations
const suivibudgetroute = require("./feature/consultations/routes/suivibudget.route");
const journalpaiement = require("./feature/consultations/routes/operationConsultation.route");
const decaissementaj = require("./feature/consultations/routes/decaissementAj.route");
// Stats Nature par département route
const statsnaturepardepartementroute = require("./feature/consultations/routes/statsNatureByDept.route");
// Stats Demande par statut route
const statsdemandeparstatutroute = require("./feature/consultations/routes/statsDemandeParStatut.route");
// stats Budget validé
const statsvalidatedbudgetroute = require("./feature/consultations/routes/statsBudgetValide.route");
//
const statsMontantByDeptRoute = require("./feature/consultations/routes/statsMontantByDept.route");
// solde caisse
const statsMontantByCaisseRoute = require("./feature/consultations/routes/soldeByCaisse.route");
// mouvements caisse
const mouvementsCaisseRoute = require("./feature/consultations/routes/mouvementcaisse.route");

// Declaration des routes pour les paramètres
const motifsroutes = require("./feature/gestion_paramètres/routes/motif.route");
const compteursroutes = require("./feature/gestion_paramètres/routes/compteur.route");

// Justifacatif operation
const justificatifoperationroute = require("./feature/gestion_paramètres/routes/justificatifOperation.routes");
// Détails justificatif
const detailsjustificatifroute = require("./feature/gestion_paramètres/routes/detailsJustificatifOperation.routes");
// Transfert fond
const transfertroute = require("./feature/gestion_operation_caisse/routes/transfert.route");
//comptabilisation
const ecritureRoutes = require("./feature/gestion_comptabilisation/routes/ecriture.route");


const db = require('./config/db');

//connexion db Richard
const {connectInstance} = require('./config/db')

dotenv.config({path: './config/.env'});
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

//LANCEMENT DE LA BASE DE DONNEES
connectInstance();


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
app.use('/API',utilisateur_role);
app.use('/API',utilisateurdept);

// Gestion donnee de base
app.use("/API/tiers", tiersroutes);
app.use("/API/plancomptable", plancomptableroutes);
app.use("/API/natureoperation", natureoperationroutes);
app.use("/API/centreanalytique", centreanalytiqueroutes);
app.use("/API/affectationanalytique", affectationanalytiqueroutes);
app.use("/API/affectationnaturecentre", affnaturecentreroutes);
app.use("/API/affectationdepartementnature", affdepartementnatureroutes);


// Test SQL Server connection Sequelize 
sequelize
  .authenticate()
  .then(() => console.log('Connexion SQL Server OK sequelize✔️'))
  .catch((err) => console.log('Erreur SQL Server ❌', err))


//Regrouper toutes les routes
app.use('/api/budget', budget_route) //Budget
app.use('/api/ligne-budgetaire', ligne_budgetaire_route) //Ligne budgetaire
app.use('/api/entete-demande', entete_demande_route) //Entete demande
app.use('/api/ligne-demande', ligne_demande_route) //Ligne demande
app.use('/api/details-demande', details_demande_route) //Details demande


//GESTION OPERATION CAISSE ROUTES
app.use("/API/journal", journalRoutes);
app.use("/API/caisse", caisseRoutes);
app.use("/API/utilisateur_caisse", utilisateurcaisseRoutes);
app.use("/API/entete_operation", enteteoperationRoutes);
app.use("/API/ligne_operation", ligneoperationRoutes);
app.use("/API/operation", typeoperationRoutes);
app.use("/API/operation", transfertroute);

//Regrouper toutes les routes
app.use("/API/circuitvalidateur", circuitvalidateurroute);
app.use("/API/circuitvalidation", circuitvalidationroute);
app.use("/API/circuitetape", circuitetaperoute);
app.use("/API/etapevalidateur", etapevalidateurroute);
app.use("/API/validationdemande", validationdemanderoute);


//Regrouper toutes les routes pour les consultations
app.use("/API/suivibudget", suivibudgetroute);
app.use("/API/consultation", journalpaiement);
app.use("/API/consultation", decaissementaj);

//Regrouper toutes les routes pour les paramètres
app.use("/API/motif", motifsroutes);
app.use("/API/modelecompteur", compteursroutes);

// Regrouper toutes les routes pour les justificatifs
app.use("/api/justificatifs", justificatifoperationroute);
app.use("/api/justificatifs-details", detailsjustificatifroute);

// Stats nature par departement
app.use("/api/stats", statsnaturepardepartementroute);
app.use("/api/statsdemande", statsdemandeparstatutroute);
app.use("/api/statsbudget", statsvalidatedbudgetroute);
app.use("/api/statsmontant", statsMontantByDeptRoute);
app.use("/api/statscaisse", statsMontantByCaisseRoute);
app.use("/api/mouvements-caisse", mouvementsCaisseRoute);

//comptabilisation
app.use("/api/comptabilisation", ecritureRoutes);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & exit process
    server.close(() => process.exit(1));
});