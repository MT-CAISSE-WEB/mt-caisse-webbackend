const { DateTime } = require('mssql');
const {sql, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

const query = `SELECT DISTINCT codesociete, raisonsociale FROM Societe ORDER BY codesociete`;

