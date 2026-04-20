
const { DateTime, UniqueIdentifier } = require('mssql');
const {db, sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const query = require("../query/requete.query");

async function getparamcomptable(){
    try{
        const pool = await connectDB();
        const result = await pool.request()
        .query(`select p.*,j.codejournal,pl.numcompte
                from parametreComptable p
                inner join journal j on j.idjournal = p.idjournal
                inner join PlanComptable pl on pl.idcompte = p.idcompte`);
         return {
            success: true,
            status: 200,
            message: "Opération récupérée avec succès !",
            data: result.recordsets
        };
    }
    catch (error){
             return {success:false,status:500,message:`Erreur de recuperation: ${error}`.cyan.bold};
    }
}

async function getnatureoperationdecaj(){
    try {
        const pool = await connectDB();
        const result = await pool.request()
        .query(`select n.*,pl.numcompte from NatureOperation n
                inner join PlanComptable pl on pl.idcompte = n.idcompte
                where n.decajustifier=1`);
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

async function getjustificatifbyid(idjustificatif){
    try {
        const pool = await connectDB();
        const result = await pool.request()
        .input("idjustificatif",sql.UniqueIdentifier,idjustificatif)
        .query(`select j.*,d.codedevise 
            from JustificatifOperation j
            inner join devise d on d.iddevise = j.iddevise where idjustificatifoperation=@idjustificatif`);


         return {
            success: true,
            status: 200,
            message: "Opération récupérée avec succès !",
            data: result.recordsets[0]
        };
    } catch (error) {
         return {success:false,status:500,message:`Erreur de recuperation: ${error}`.cyan.bold};
    }
}

async function getjustificatifdetailsbyid(idjustificatif){
    try {
        const pool = await connectDB();
        const result = await pool.request()
        .input("idjustificatif",sql.UniqueIdentifier,idjustificatif)
        .query(query.queryjustificatifdetailsbyid); 


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

async function getecriturecomptablebyid(idtypeoperation){
    try {
        const pool = await connectDB();
        const result = await pool.request()
        .input("idtypeoperation",sql.UniqueIdentifier,idtypeoperation)
        .query("select * from EcritureComptable where  idtypeoperation=@idtypeoperation"); 

         return {
            success: true,
            status: 200,
            message: "Opération récupérée avec succès !",
            data: result.recordsets
        };
    } catch (error) {
         console.log(error);
         return {success:false,status:500,message:`Erreur de recuperation: ${error}`.cyan.bold};
    }
}





module.exports = {
    getparamcomptable,
    getnatureoperationdecaj,
    getecriturecomptablebyid,
    getenteteoperationbyid,
    gettypeoperationbyid,
    getligneoperationbyidoperation,
    getjustificatifbyid,
    getjustificatifdetailsbyid
}
