const dotenv = require('dotenv');
dotenv.config({path: './config/.env'});
const sql = require("mssql");
const fs = require('fs');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, // ou l’adresse IP du serveur
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // true si Azure
    trustServerCertificate: false,
    //instanceName: process.env.DB_INSTANCE || undefined, // Nom de l'instance SQL Server, si applicable
  },
};

const createDB = async () =>{
  try {
    const db = await sql.connect({...config , database : 'MTCAISSEWEB'});
    const table = fs.readFileSync("./config/test.sql", "utf8");
    await db.request().query(table);
    db.close();
    console.log(`Tables créees`.yellow.bold);
  } catch (error) {
    console.log(`Erreur de création des tables: ${error}`.red.bold);
  }
}

const connectDB = async () => {
  try {
    const db = await sql.connect({...config , database : 'MTCAISSEWEB'});
    console.log(`Connecté à la base de données`.cyan.bold);
    return db;
  } catch (error) {
    console.log(`${error}`.red.bold);
    throw error;
  }
}

const connectInstance = async () => {
  try {
    const pool = await sql.connect(config);
    const dbPool = fs.readFileSync("./config/db.sql", "utf8");
    try{
      await pool.request().query(dbPool);
      createDB();
    }catch (err){
      console.log(`${err}`.cyan.bold);
    }
  } catch (err) {
    console.log(`${err}`.cyan.bold);
  }
}

module.exports =  {connectInstance,connectDB, sql};
