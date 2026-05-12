
const { DateTime, UniqueIdentifier } = require('mssql');
const {db, sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

const today = new Date();

const queryinsert = `
        INSERT INTO ligneEcritureComptable (idligneecriture ,idecriture,idcentreanalytique,centreanalytique, idcompte,compte,idtiers,tiers,numligne ,typeecriture,libelle,debit,credit,etat,iddevise,devise,montantdevise,taux,montantbase,createdby,createdat)
        OUTPUT INSERTED.*
        VALUES (@idligneecriture, @idecriture, @idcentreanalytique, @centreanalytique, @idcompte, @compte, @idtiers, @tiers, @numligne, @typeecriture, @libelle, @debit, @credit, @etat, @iddevise, @devise, @montantdevise, @taux, @montantbase, @createdby, @createdat)
        `;

    //Create Ecriture
    async function createligneEcriture(data){
        try {
            const pool = await connectDB()
            const idligneecriture = uuidv4();
            const result = await pool.request()
            .input('idligneecriture', sql.UniqueIdentifier,idligneecriture)
            .input ('idecriture', sql.UniqueIdentifier,data.idecriture)
            .input ('idcentreanalytique', sql.UniqueIdentifier,data.idcentreanalytique)
            .input ('centreanalytique', sql.NVarChar(50),data.centreanalytique)
            .input ('idcompte', sql.UniqueIdentifier,data.idcompte)
            .input ('compte', sql.NVarChar(50),data.compte)
            .input ('idtiers', sql.UniqueIdentifier,data.idtiers)
            .input ('tiers', sql.NVarChar(50),data.tiers)
            .input ('numligne', sql.Int,data.numligne)
            .input ('typeecriture', sql.NVarChar(50),data.typeecriture)
            .input ('libelle', sql.NVarChar(100),data.libelle)
            .input ('debit', sql.Decimal(18,2),data.debit)
            .input ('credit', sql.Decimal(18,2),data.credit)
            .input ('etat', sql.NVarChar(20),data.etat)
            .input ('iddevise', sql.UniqueIdentifier,data.iddevise)
            .input ('devise', sql.NVarChar(50),data.devise)
            .input ('montantdevise', sql.Decimal(18,2),data.montantdevise)
            .input ('taux', sql.Decimal(18,2),data.taux)
            .input ('montantbase', sql.Decimal(18,2),data.montantbase)
            .input ('createdat', sql.DateTime,today)
            .input ('createdby', sql.NVarChar(50),data.createdby)
            .query(queryinsert);

            return {
                success:true,
                status:201,
                data: result.recordset[0],
                message: "Création effectuée avec succès!"
            }
        } catch (error) {
            return { success: false, status:500, message:`Erreur lors de la création : ${error}`.cyan.bold};
        }
    }

   // Get all
    async function getallLigneEcriture(idsite, datedebut, datefin, etat, journal,typeecriture){
        try {
            const pool = await connectDB();
            const query = `SELECT 
    elc.idligneecriture,
    elc.numligne,
    ec.ref_ecriture,
    ec.num_piece,
    ec.journal,
    ec.date_operation,
    elc.idcentreanalytique,
    elc.centreanalytique,
    elc.typeecriture,
    elc.etat,
    elc.idcompte,
    elc.compte,
    elc.idtiers,
    elc.tiers,
    elc.libelle,
    elc.debit,
    elc.credit,
    (elc.debit + elc.credit) AS montant,
    elc.iddevise,
    elc.devise,
    st.idsite,
    st.codesite,
    st.libelle as site_libelle
FROM EcritureLigneComptable elc
INNER JOIN EcritureComptable ec 
    ON ec.idecriture = elc.idecriture
inner join TypeOperation ty on ty.idtypeoperation=ec.idtypeoperation
inner join site st on st.idsite = ty.idsite

WHERE
    (@idsite IS NULL OR ty.idsite = @idsite)
AND (@datedebut IS NULL OR ec.date_operation >= @datedebut)
AND (@datefin IS NULL OR ec.date_operation < DATEADD(DAY, 1, @datefin))
AND (@etat is null or @etat ='' or elc.etat=@etat)
AND (@journal is null or @journal='' or ec.journal=@journal)
AND (@typeecriture is null or @typeecriture='' or elc.typeecriture=@typeecriture)
order by ec.date_operation desc, ec.ref_ecriture desc, elc.numligne asc`;
            const result = await pool.request()
            .input('idsite', sql.UniqueIdentifier, idsite || null)
            .input('datedebut', sql.DateTime, datedebut || null)
            .input('datefin', sql.DateTime, datefin || null)
            .input('etat', sql.NVarChar(20), etat || null)
            .input('journal', sql.NVarChar(50), journal || null)
            .input('typeecriture', sql.NVarChar(50), typeecriture || null)
            .query(query);

            return {
                success :true,
                status:200, 
                data : result.recordsets[0],
                message : "Eléments trouvés avec succès!"}
        } catch (error) {
            return {success:false,status:500,message:`Erreur de recuperation: ${error}`.cyan.bold};
        }
    }


    async function comptabilisationEcriture (idoperation,idsite, datedebut, datefin, journal){
        const pool = await connectDB();
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();

            const request = transaction.request();

            // ==============================
            // PARAMÈTRES
            // ==============================
            request.input("idoperation", sql.UniqueIdentifier, idoperation || null);
            request.input("idsite", sql.UniqueIdentifier, idsite || null);
            request.input("datedebut", sql.DateTime, datedebut || null);
            request.input("datefin", sql.DateTime, datefin || null);
            request.input("journal", sql.NVarChar, journal || null);

            const ecritures = await request.query(`SELECT 
            ec.idecriture,
            SUM(elc.debit) AS totalDebit,
            SUM(elc.credit) AS totalCredit
            FROM EcritureComptable ec
            INNER JOIN EcritureLigneComptable elc on elc.idecriture = ec.idecriture
            inner join TypeOperation ty on ty.idtypeoperation=ec.idtypeoperation
            inner join site st on st.idsite = ty.idsite
            WHERE
            (@idoperation IS NULL OR ty.idoperation = @idoperation)
            AND (@idsite IS NULL OR ty.idsite = @idsite)
            AND (@datedebut IS NULL OR ec.date_operation >= @datedebut)
            AND (@datefin IS NULL OR ec.date_operation < DATEADD(DAY,1,@datefin))
            AND (@journal IS NULL OR @journal = '' OR ec.journal = @journal)
            AND elc.etat = 'en attente'

        GROUP BY ec.idecriture`);

        if (!ecritures.recordset.length) {
                throw new Error("Aucune écriture à comptabiliser");
        }

        // ==============================
            // 2. CONTRÔLE ÉQUILIBRE
            // ==============================
            for (const e of ecritures.recordset) {
                if (Number(e.totalDebit) !== Number(e.totalCredit)) {
                    throw new Error(
                        `Écriture déséquilibrée (${e.idecriture}) : D=${e.totalDebit} C=${e.totalCredit}`
                    );
                }
            }

            // ==============================
            // 3. VALIDATION DES LIGNES
            // ==============================
            await request.query(`
                UPDATE elc
                SET 
                    elc.etat = 'validee',
                    elc.typeecriture = 'normale'
                FROM EcritureLigneComptable elc
                INNER JOIN EcritureComptable ec 
                    ON ec.idecriture = elc.idecriture
                inner join TypeOperation ty on ty.idtypeoperation=ec.idtypeoperation
                inner join site st on ty.idsite = ty.idsite
                where
                (@idoperation IS NULL OR ty.idoperation = @idoperation)
                AND (@idsite IS NULL OR st.idsite = @idsite)
                AND (@datedebut IS NULL OR ec.date_operation >= @datedebut)
                AND (@datefin IS NULL OR ec.date_operation < DATEADD(DAY,1,@datefin))
                AND (@journal IS NULL OR @journal = '' OR ec.journal = @journal)
                AND elc.etat = 'en attente'`);

            await transaction.commit();

                return {
                    success: true,
                    status: 200,
                    message: "Comptabilisation effectuée avec succès !"
                };


        }
        catch (error) {
            return {success:false,status:500,message:`Erreur de recuperation: ${error}`.cyan.bold};
        }

    }

    module.exports = {
        getallLigneEcriture,
        comptabilisationEcriture,

    }