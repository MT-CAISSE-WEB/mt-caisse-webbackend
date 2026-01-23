const { v4: uuidv4, validate } = require('uuid');
const db = require('../../../config/db');
const {sql, connectInstance, connectDB} = require('../../../config/db');
const config = db.config;
const enteteDemandeModel = require("../../gestion_demande_decaissement/models/entetedemande.model");
let modelcircuit = new enteteDemandeModel();
const circuitquery = require('../queries/circuitvalidation.query');
const budgetcontroller = require('../controllers/budget.controller');


//Recuperer le budget par idbudget
async function get_budgetByid(idbudget){
    const pool = await connectDB()
    const result = await pool.request()
        .input('idbudget', sql.UniqueIdentifier, idbudget)
        .query(circuitquery.getBudgetById)

    return result.recordset[0];
}

//Récuperer les validateurs d'un circuit
async function get_validateursCircuit(idcircuit){

    if(!idcircuit){
        throw new Error('Identifiant du circuit inexistant');
    }

    try {
        const validateurs = modelcircuit.prepareValidateurCircuit(idcircuit);

        return validateurs;
    } catch (error) {
        throw new Error(error);
    }
}

//Creation || initialisation des validateurs dans la table ValidationBudget
async function initValidationBudget(data){
    const pool = await connectDB()
    try {
      const result = await pool.request()
      .input('idbudget', sql.UniqueIdentifier, data.idbudget)
      .input('idcircuitvalidation', sql.UniqueIdentifier, data.idcircuitvalidation)
      .input('idcircuitetape', sql.UniqueIdentifier, data.idcircuitetape)
      .input('idutilisateur', sql.UniqueIdentifier, data.user)
      .input('rang', sql.Int, data.rang)
      .query(circuitquery.initvalidationBudget)

      return result.recordset
      
    } catch (error) {
      return error
    }
}

//Methode de creation du circuit validation du budget
async function initCircuitBudget(budget){
    let validateurs = [];
    //Récupérer les validateurs
    validateurs = await get_validateursCircuit(budget.idcircuitvalidation);

    if(!validateurs || validateurs.lenght == 0){
        throw new Error('Aucun validateurs existant dans le circuit');
    }else{
        for(const valid of validateurs){
            //Prépare data des validateurs 
            const dataValidateurs = {idbudget: budget.idbudget, idcircuitvalidation: valid.idcircuitvalidation, idcircuitetape : valid.idcircuitetape, user: valid.idutilisateur, rang: valid.rang};
            // Enregistrer
            try {
                await initValidationBudget(dataValidateurs);
            } catch (error) {
                throw new Error(error);
            }
        }
    }
}

exports.initCircuitBudget =  initCircuitBudget;

// Récupérer des validateurs du budget idbudget
async function get_validateurCircuit(idbudget) {
    const pool = await connectDB()
    const result = await pool.request()
        .input('idbudget', sql.UniqueIdentifier, idbudget)
        .query(circuitquery.circuitValidateur)

    return result.recordset;
}

// Récuperer le circuit de type entite societe
async function get_circuitEntiteSociete(idsociete){
    const pool = await connectDB()
    const result = await pool.request()
      .input('idsociete', sql.UniqueIdentifier, idsociete)
      .query(circuitquery.circuitBudget)

    return result.recordset
}

//Envoyer idbudget pour récuperer les validateurs du circuit du budget
exports.get_validateurBudget = async (req, res ) => {
    try {
        const idbudget = req.params.id;
        if (!idbudget) {
            throw new Error("ID demande requis");
        }
        const validateurs = await get_validateurCircuit(idbudget);
        res.json({ success: true, data: validateurs, message: "Validateurs du circuit" });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
}

//Check right de l'utilisatuer
async function check_rightUser(data) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('idbudget', sql.UniqueIdentifier, data.idbudget)
      .input('iduser', sql.UniqueIdentifier, data.iduser)
      .input('niveauactuel', sql.Int, data.niveauactuel)
      .query(circuitquery.checkRight)

    return result.recordset
}

// Save decision de l'utilisateur
async function save_decision(data) {
    const pool = await connectDB()
    const result = await pool.request()
        .input('idbudget', sql.UniqueIdentifier, data.idbudget)
        .input('iduser', sql.UniqueIdentifier, data.iduser)
        .input('commentaire', sql.NVarChar(255), data.commentaire)
        .input('decision', sql.NVarChar(20), data.decision)
        .query(circuitquery.saveDecision)

    return result.recordset
}

// Récuperer le dernier validateur d'un circuit pour un budget
async function get_dernierniveau(idbudget, idcircuit) {
    const pool = await connectDB()
    const result = await pool.request()
        .input('idbudget', sql.UniqueIdentifier, idbudget)
        .input('idcircuit', sql.UniqueIdentifier, idcircuit)
        .query(circuitquery.dernierNiveau)

    return result.recordset
}

//Valider le budget
async function validateBudget(idbudget, data){
  if (!idbudget || !data.decision) {
    throw new Error("Aucune donnée reçue");
  }

  if (data.decision === 'refuser' && !data.motif) {
    throw new Error("Motif requis");
  }

  if (data.decision === 'complement' && !data.motif) {
    throw new Error("Motif requis");
  }

  //Recuperer le budget par idbuget
  let budget = null; 
  budget = await get_budgetByid(idbudget);
  if (!budget) {
    throw new Error("Budget inexistant");
  }

  if(budget.valide > 1){
    throw new Error("Budget non validable");
  }else{
    const filtreData = {idbudget: budget.idbudget, iduser : data.iduser, niveauactuel: budget.niveauactuel};
    const rights = await check_rightUser(filtreData);
    if(!rights.length){
        throw new Error("Vous n'êtes pas autorisé à valider à ce niveau");
    }

    //Mapper la décision utilisateur
    let reponse = null;
    if(data.decision == 'accepter'){
        reponse = 'approuve';
    }else if(data.decision == 'refuser'){
        reponse = 'rejete';
    }else{
        reponse = 'revoir'
    }

    const decisionPayload = {
      idbudget: data.idbudget,
      iduser: data.iduser,
      motif: data.motif ?? null,
      commentaire: data.comment ?? null,
      decision: reponse
    };

    //Enregistrer la décision
    await save_decision(decisionPayload);

    //Cas REFUS → rejet immédiat
    // if (!isAccepted) {
    //   await update_statut({
    //     idbudget: budget.idbudget,
    //     statut: 3 // REJETÉE
    //   });
    //   return;
    // }

    // Get niveauactuel du budget
    const { valide, niveauactuel } = budget;

    // vérifier si dernier niveau atteint
    const [{ dernierRang }] = await get_dernierniveau(budget.idbudget, budget.idcircuitvalidation);
    //Si le budget a pour circuit type entite
    const circuit = await get_circuitvalidation(budget.idcircuitvalidation);
    
    let upvalide = 0;
    if (niveauactuel === dernierRang) {
      // validation finale
      await update_statut({
        idbudget: idbudget,
        valide: 1 // VALIDÉE
      });

      upvalide = 1;
      if(circuit.typeentite == 'site'){
        try {
            //Récuperer le circuit de type entite societe
            const circuit_societe = await get_circuitEntiteSociete(budget.idsociete);
            if(!circuit_societe || circuit_societe.length == 0){
                throw new Error("Circuit de type entite societé inexistant");
            }

            const init_dataCircuit = {
                idcircuit: circuit_societe.idcircuitvalidation,
                idbudget : budget.idbudget,
                niveauactuel : 1,
                valide : 0
            }

            //Rattacher le circuit societe et renitialiser les variables de validation
            const new_budget = await update_circuit(init_dataCircuit);
           
            //Initialiser le circuit avec le nouveau budget modifié
            await initCircuitBudget(new_budget);
        } catch (error) {
            throw new Error(error);
        }
      }

    } else {
      // passer au circuit etape suivant
      await nextNiveauactuel(idbudget);
    }

    const payload = {idbudget: budget.idbudget, valide: upvalide};
    
    if(circuit.typeentite == 'site'){
        await update_budgetSite(payload);
    }else{
        await update_budgetSociete(payload);
    }
  }

  return {message: "Budget validée" };
}

async function update_statut(data) {
    const pool = await connectDB()
    const result = await pool.request()
        .input('idbudget', sql.UniqueIdentifier, data.idbudget)
        .input('valide', sql.Int, data.valide)
        .query(circuitquery.updateStatut)

    return result.recordset
}

async function nextNiveauactuel(idbudget) {
    const pool = await connectDB()
    const result = await pool.request()
        .input('idbudget', sql.UniqueIdentifier, idbudget)
        .query(circuitquery.niveauActuel)

    return result.recordset
}

//Recuperer le circuit validation par idcircuit
async function get_circuitvalidation(idcircuit){
    const pool = await connectDB()
    const result = await pool.request()
        .input('idcircuit', sql.UniqueIdentifier, idcircuit)
        .query(circuitquery.circuitvalidation)

    return result.recordset[0];
}

// Rattacher le budget societe
async function update_circuit(data) {
    const pool = await connectDB()
    const result = await pool.request()
        .input('idbudget', sql.UniqueIdentifier, data.idbudget)
        .input('idcircuit', sql.UniqueIdentifier, data.idcircuit)
        .input('niveauactuel', sql.Int, data.niveauactuel)
        .input('valide', sql.Int, data.valide)
        .query(circuitquery.updateCircuit)

    return result.recordset
}

// Mise a jour du budget les champs site
async function update_budgetSite(data) {
    const pool = await connectDB()
    const result = await pool.request()
        .input('idbudget', sql.UniqueIdentifier, data.idbudget)
        .input('datevalidesite', sql.DateTime, new Date())
        .input('validesite', sql.Int, data.valide)
        .query(circuitquery.updateBudgetSite)

    return result.recordset
}

// Mise a jour du budget les champs societe
async function update_budgetSociete(data) {
    const pool = await connectDB()
    const result = await pool.request()
        .input('idbudget', sql.UniqueIdentifier, data.idbudget)
        .input('datevalidesociete', sql.DateTime, new Date())
        .input('validesociete', sql.Int, data.valide)
        .query(circuitquery.updateBudgetSociete)

    return result.recordset
}

//Envoyer idbudget pour récuperer les validateurs du circuit du budget
exports.validerBudget = async (req, res ) => {
    try {
        const idbudget = req.params.id;
        if (!idbudget) {
            throw new Error("ID Budget requis");
        }
        const validateurs = await validateBudget(idbudget, req.body);
         res.json({ success: true, message: "Décision pris en compte" });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
}

