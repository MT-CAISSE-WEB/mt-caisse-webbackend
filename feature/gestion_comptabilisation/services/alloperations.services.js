
const { DateTime, UniqueIdentifier } = require('mssql');
const {db, sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const query = require("../query/requete.query");


async function getenteteoperationbyid(idoperation){
    try {
        const pool = await connectDB();
        const result = await pool.request()
        .input("idoperation",sql.UniqueIdentifier,idoperation)
        .query("select * from EnteteOperationCaisse where idoperation=@idoperation");

         return {
            success: true,
            status: 200,
            message: "Opération récupérée avec succès !",
            data: result.recordset[0]
        };
    } catch (error) {
         return {success:false,status:500,message:`Erreur de recuperation: ${error}`.cyan.bold};
    }
}

async function gettypeoperationbyid(idoperation){
    try {
        const pool = await connectDB();
        const result = await pool.request()
        .input("idoperation",sql.UniqueIdentifier,idoperation)
        .query(query.querytypeoperation);

         return {
            success: true,
            status: 200,
            message: "Opération récupérée avec succès !",
            data: result.recordsets
        };
    } catch (error) {
         return {success:false,status:500,message:`Erreur de recuperation: ${error}`.cyan.bold};
    }
}

async function getligneoperationbyidoperation(idoperation){
    try {
        const pool = await connectDB();
        const result = await pool.request()
        .input("idoperation",sql.UniqueIdentifier,idoperation)
        .query(query.queryligneoperationbyidoperation);

         return {
            success: true,
            status: 200,
            message: "Opération récupérée avec succès !",
            data: result.recordsets
        };
    } catch (error) {
         return {success:false,status:500,message:`Erreur de recuperation: ${error}`.cyan.bold};
    }
}

module.exports = {
    getenteteoperationbyid,
    gettypeoperationbyid,
    getligneoperationbyidoperation
}
