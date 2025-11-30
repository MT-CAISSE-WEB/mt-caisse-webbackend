const dotenv = require('dotenv');
dotenv.config({path: './config/config.env'});
const sql = require("mssql");
const fs = require('fs');


const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, // ou l’adresse IP du serveur
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // true si Azure
    trustServerCertificate: true,
    // instanceName: process.env.DB_INSTANCE || undefined, // Nom de l'instance SQL Server, si applicable
  },
};

const createDB = async () =>{
  try {
    const db = await sql.connect({...config , database : 'MTCAISSEWEB'});
    const table = fs.readFileSync("./config/init.sql", "utf8");
    await db.request().query(table);
    db.close();
    // console.log(`Tables créees`.yellow.bold);
  } catch (error) {
    console.log(`Erreur de création des tables: ${error}`.red.bold);
  }
}

const connectDB = async () => {
  try {
    const db = await sql.connect({...config , database : 'MTCAISSEWEB'});
    // console.log(`Connecté à la base de données`.cyan.bold);
    return db;
  } catch (error) {
    console.log(`Erreur de connexion: ${error}`.red.bold);
    throw error;
  }
}

const connectInstance = async () => {
  try {
    console.log(config)
    const pool = await sql.connect(config);
    // console.log(`Connecté à SQL Server`.cyan.bold);
    const dbPool = fs.readFileSync("./config/db.sql", "utf8");
    try{
      await pool.request().query(dbPool);
      createDB();
    }catch (err){
      console.log(`Erreur de création de la base de donnée: ${err}`.cyan.bold);
    }
  } catch (err) {
    console.log(`Erreur de connexion: ${err}`.cyan.bold);
  }
}


//un pool spécifique pour les opérations de la base de données
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connecté à SQL Server');
    return pool;
  })
  .catch(err => {
    console.log('Erreur de connexion SQL Server', err);
    throw err;
  });

module.exports =  {connectInstance, connectDB, poolPromise, sql};