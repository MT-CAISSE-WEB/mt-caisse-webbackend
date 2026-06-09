const enteteDemandeModel = require("../models/entetedemande.model");
const societemodel = require("../../gestion_organisation/models/societe.model");
const sitemodel = require("../../gestion_organisation/models/site.model");
const devisemodel = require("../../gestion_organisation/models/devise.model");
const { v4: uuidv4 } = require("uuid");
const PaginationModel = require("../../../shared/utils/model");
const deviseservice = require("../../gestion_organisation/services/devise.service");
const societeservice = require("../../gestion_organisation/services/societe.service");
const siteservice = require("../../gestion_organisation/services/site.service");
const enteteoperationmodel = require("../../gestion_operation_caisse/models/enteteoperation.model");
const lignedemandeservice = require("../services/ligendemande.service");
const detaildemandeservice = require("../services/detaildemande.service");
const userservice = require("../../gestion_users/services/users.service");
const lignedemandeModel = require("../models/lignedemande.model");
const compteurservice = require("../../gestion_paramètres/services/compteur.service");

// pour gestion des pj
const { upload } = require("../../../middlewares/upload/pjdemande");
const path = require("path");
const fs = require("fs").promises;
const sequelize = require("../../../config/database");
const AdmZip = require("adm-zip");

let demandeModel = new enteteDemandeModel();
let demandesArray = [];
let enteteoperation = new enteteoperationmodel();
let lignedemandemodel = new lignedemandeModel();

/**
 * Classe d'erreur personnalisée pour les demandes de décaissement
 */
class DemandeError extends Error {
  constructor(message, code = "DEMANDE_ERROR", details = {}) {
    super(message);
    this.name = "DemandeError";
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Valide les données d'entrée initiales
 * @param {Object} data Données de la demande
 * @throws {DemandeError} Si les données sont invalides
 */
function validateInitialData(data) {
  if (!data) {
    throw new DemandeError("Données de demande manquantes", "INVALID_DATA");
  }

  if (!Array.isArray(data.lignes) || data.lignes.length === 0) {
    throw new DemandeError(
      "Au moins une ligne de demande est requise",
      "NO_LINES",
    );
  }

  if (!data.societe) {
    throw new DemandeError("Société manquante", "NO_SOCIETE");
  }

  if (!data.site) {
    throw new DemandeError("Site manquant", "NO_SITE");
  }

  if (!data.devise) {
    throw new DemandeError("Devise manquante", "NO_DEVISE");
  }

  if (!data.demandeur) {
    throw new DemandeError("Demandeur manquant", "NO_DEMANDEUR");
  }

  if (!data.typedemande) {
    throw new DemandeError("Type de demande manquant", "NO_TYPE_DEMANDE");
  }

  if (!data.datedemande) {
    throw new DemandeError("Date de demande manquante", "NO_DATE");
  }

  // Valider la date de demande
  const date = new Date(data.datedemande);
  if (isNaN(date.getTime())) {
    throw new DemandeError("Date de demande invalide", "INVALID_DATE", {
      date: data.datedemande,
    });
  }

  // Valider chaque ligne
  data.lignes.forEach((ligne, index) => {
    if (!ligne.natureop) {
      throw new DemandeError(
        `Nature d'opération manquante à la ligne ${index + 1}`,
        "LINE_NO_NATURE",
        { lineIndex: index },
      );
    }
    if (!ligne.montantdemande || ligne.montantdemande <= 0) {
      throw new DemandeError(
        `Montant invalide à la ligne ${index + 1}`,
        "INVALID_MONTANT",
        { lineIndex: index },
      );
    }
    if (!Array.isArray(ligne.details)) {
      throw new DemandeError(
        `Détails invalides à la ligne ${index + 1}`,
        "INVALID_DETAILS",
        { lineIndex: index },
      );
    }
    // Note: La validation du centre analytique se fait dans validateBudgetsForLines
    // car elle dépend du type de budget (analytique ou non)
  });
}

/**
 * Récupère et valide les ressources parallèlement (societe, site, devise)
 * @param {string} idSociete ID de la société
 * @param {string} idSite ID du site
 * @param {string} idDevise ID de la devise
 * @return {Promise<{societe, site, devise}>}
 * @throws {DemandeError} Si une ressource est introuvable
 */
async function resolveAndValidateResources(idSociete, idSite, idDevise) {
  try {
    const [societe, site, devise] = await Promise.all([
      societeservice.getonesociete(idSociete),
      siteservice.getonesite(idSite),
      deviseservice.getonedevise(idDevise),
    ]);

    if (!societe || !societe.data) {
      throw new DemandeError("Société introuvable", "SOCIETE_NOT_FOUND", {
        idSociete,
      });
    }

    if (!site || !site.data) {
      throw new DemandeError("Site introuvable", "SITE_NOT_FOUND", { idSite });
    }

    if (!devise) {
      throw new DemandeError("Devise introuvable", "DEVISE_NOT_FOUND", {
        idDevise,
      });
    }

    return { societe, site, devise };
  } catch (error) {
    if (error instanceof DemandeError) throw error;
    throw new DemandeError(
      `Erreur lors de la résolution des ressources: ${error.message}`,
      "RESOURCE_RESOLUTION_ERROR",
    );
  }
}

/**
 * Valide les budgets pour une demande si suivi budgétaire actif
 * @param {Object} societe Objet société
 * @param {Array} lignes Lignes de la demande
 * @param {Object} filterData Données de filtrage
 * @throws {DemandeError} Si le budget est insuffisant
 */
async function validateBudgetsForLines(societe, lignes, filterData) {
  if (!societe || societe.data.suivibudgetaire !== 1) {
    return; // Pas de suivi budgétaire
  }

  try {
    // Ramener les budgets valides pour la société et le site en une seule requête pour optimiser
    const selectBudget = await lignedemandemodel.checktypebudget(filterData);

    if (!selectBudget || selectBudget.length === 0) {
      console.warn(
        "Aucun budget trouvé → pas de contrôle budgétaire",
        filterData,
      );
      return;
      // throw new DemandeError("Aucun budget valide trouvé pour prioriser le budget mensuel si plusieurs budgets sont retournés"
      //   , "NO_VALID_BUDGETS", { filterData });
    }

    const budgetPriorise = prioriserBudget(selectBudget);

    //Si le budget priorisé est analytique, on ne fait pas le contrôle budgétaire sur la nature mais sur le centre
    if (budgetPriorise.isanalytique && budgetPriorise.isanalytique === 1) {
      // Validation préalable : vérifier que tous les centres sont fournis AVANT la création de l'entête
      const lignesSansCentre = lignes.filter((ligne) => !ligne.centre);
      if (lignesSansCentre.length > 0) {
        throw new DemandeError(
          "Centre analytique manquant pour certaines lignes en mode budgétaire analytique",
          "MISSING_CENTRE_ANALYTIQUE",
          {
            lignesSansCentre: lignesSansCentre.map(
              (l) => l.numligne || "inconnu",
            ),
          },
        );
      }

      // Validation analytique par centre
      await validateBudgetsAnalytique(lignes, filterData);
    } else {
      // Validation classique par nature d'opération
      await validateBudgetsNature(lignes, filterData);
    }
  } catch (error) {
    if (error instanceof DemandeError) throw error;
    throw new DemandeError(
      `Erreur validation budgétaire: ${error.message}`,
      "BUDGET_VALIDATION_ERROR",
    );
  }
}

/**
 * Valide les budgets de manière analytique (par centre)
 * @param {Array} lignes Lignes de la demande
 * @param {Object} filterData Données de filtrage
 */
async function validateBudgetsAnalytique(lignes, filterData) {
  // Validation des budgets en parallèle pour optimiser
  const validationPromises = lignes.map(async (ligne, index) => {
    try {
      const budgetsAll = await lignedemandemodel.resoleveBudgetcentre({
        ...filterData,
        idcentre: ligne.centre,
        codebudgetaire: ligne.codebudget.codebudgetaire || null, // Passer le code budgetaire si disponible pour affiner la recherche du budget analytique
        idlignebudget: ligne.codebudget.idbudgetdepartementnature,
      });

      if (budgetsAll && budgetsAll.length > 0) {
        const budgets = prioriserBudget(budgetsAll);

        // Vérifier le solde du budget
        await lignedemandemodel.checkBudgetcentreSolde({
          idbudget: budgets.idbudget,
          idcentre: ligne.centre,
          montant: ligne.montantdemande,
          idlignebudget: ligne.codebudget.idbudgetdepartementnature,
        });
      } else {
        throw new Error(`Aucun budget trouvé pour le centre ${ligne.centre}`);
      }
    } catch (error) {
      throw new DemandeError(
        `Erreur de budget à la ligne ${index + 1} (centre: ${ligne.centre}): ${
          error.message
        }`,
        "BUDGET_VALIDATION_ERROR",
        { lineIndex: index, lineCentre: ligne.centre },
      );
    }
  });

  await Promise.all(validationPromises);
}

/**
 * Valide les budgets par nature d'opération
 * @param {Array} lignes Lignes de la demande
 * @param {Object} filterData Données de filtrage
 */
async function validateBudgetsNature(lignes, filterData) {
  // Validation des budgets en parallèle pour optimiser
  const validationPromises = lignes.map(async (ligne, index) => {
    try {
      const budgetsAll = await lignedemandemodel.resoleveBudgetnature({
        ...filterData,
        idnature: ligne.natureop,
        codebudgetaire: ligne.codebudget.codebudgetaire || null,
        idlignebudget: ligne.codebudget.idbudgetdepartementnature,
      });

      if (budgetsAll && budgetsAll.length > 0) {
        const budgets = prioriserBudget(budgetsAll);
        // Vérifier le solde du budget
        await lignedemandemodel.checkBudgetnatureSolde({
          idbudget: budgets.idbudget,
          idnature: ligne.natureop,
          montant: ligne.montantdemande,
          idlignebudget: ligne.codebudget.idbudgetdepartementnature,
          iddepartement: filterData.iddepartement,
        });
      } else {
        throw new Error(`Aucun budget trouvé pour la nature ${ligne.natureop}`);
      }
    } catch (error) {
      throw new DemandeError(
        `Erreur de budget à la ligne ${index + 1} (nature: ${
          ligne.natureop
        }): ${error.message}`,
        "BUDGET_VALIDATION_ERROR",
        { lineIndex: index, lineNature: ligne.natureop },
      );
    }
  });

  await Promise.all(validationPromises);
}

/**
 * Génère le numéro de la demande
 * @param {Object} site Objet site
 * @param {Date} datePeriode Date de la demande
 * @return {Promise<string>} Numéro généré
 */
async function generateDemandeNumber(site, datePeriode) {
  try {
    const compteur = await compteurservice.getall();
    if (!compteur || !compteur.data) {
      throw new DemandeError("Compteur non disponible", "COMPTEUR_ERROR");
    }

    const demandeCompteur = compteur.data.find(
      (c) => c.typedocument === "demande",
    );
    if (!demandeCompteur) {
      throw new DemandeError(
        "Configuration compteur 'demande' introuvable",
        "COMPTEUR_CONFIG_NOT_FOUND",
      );
    }

    const prefixe = [
      resolveSequence(
        demandeCompteur.sequence_1,
        demandeCompteur.prefixe_1,
        site,
      ),
      resolveSequence(
        demandeCompteur.sequence_2,
        demandeCompteur.prefixe_2,
        site,
      ),
    ].join("");

    return await enteteoperation.create_numoperation(prefixe, datePeriode);
  } catch (error) {
    if (error instanceof DemandeError) throw error;
    throw new DemandeError(
      `Erreur de génération du numéro: ${error.message}`,
      "NUM_GENERATION_ERROR",
    );
  }
}

/**
 * Résout une séquence de numérotation
 * @param {string} sequence Type de séquence
 * @param {string} prefixe Préfixe personnalisé
 * @param {Object} site Objet site
 * @return {string} Valeur résolue
 */
function resolveSequence(sequence, prefixe, site) {
  switch (sequence) {
    case "site":
      return site?.data?.codesite || "";
    case "constante":
      return prefixe || "";
    default:
      return "";
  }
}

/**
 * Récupère et valide le circuit de validation
 * @param {string} idSite ID du site
 * @return {Promise<string|null>} ID du circuit ou null
 */
async function resolveValidationCircuit(idSite) {
  try {
    const circuit = await demandeModel.get_circuitValidation(idSite);
    return circuit && circuit.length > 0
      ? circuit[0].idcircuitvalidation
      : null;
  } catch (error) {
    throw new DemandeError(
      `Erreur circuit de validation: ${error.message}`,
      "CIRCUIT_ERROR",
    );
  }
}

/**
 * Initialise les validateurs du circuit
 * @param {string} idDemande ID de la demande
 * @param {string} idCircuit ID du circuit
 * @return {Promise<void>}
 */
async function initializeCircuitValidators(idDemande, idCircuit) {
  if (!idCircuit) return;

  try {
    const validateurs = await demandeModel.prepareValidateurCircuit(idCircuit);

    if (validateurs && validateurs.length > 0) {
      const validationPromises = validateurs.map((valid) =>
        demandeModel.initValidationDemande({
          iddemande: idDemande,
          idcircuitvalidation: valid.idcircuitvalidation,
          idcircuitetape: valid.idcircuitetape,
          user: valid.idutilisateur,
          rang: valid.rang,
        }),
      );

      await Promise.all(validationPromises);
    }
  } catch (error) {
    throw new DemandeError(
      `Erreur initialisation validateurs: ${error.message}`,
      "VALIDATORS_INIT_ERROR",
    );
  }
}

/**
 * Crée l'entête de la demande
 * @param {Object} data Données de la demande
 * @param {Object} resources Ressources résolues
 * @param {string} numerogenere Numéro généré
 * @param {string} idCircuit ID du circuit
 * @param {Date} today Date actuelle
 * @return {Promise<Object>} Entête créée avec ses données
 */
async function createEnteteDemande(
  data,
  resources,
  numerogenere,
  idCircuit,
  today,
) {
  try {
    const { societe, site, devise } = resources;

    const newEntete = new enteteDemandeModel(
      uuidv4(),
      numerogenere,
      data.demandeur,
      data.typedemande,
      data.libelledemande,
      data.taux || 1,
      data.datedemande,
      data.decaisse || 0,
      data.solde || 0,
      data.statut || 0,
      idCircuit || null,
      data.societe || societe.data.idsociete,
      data.site || site.data.idsite,
      data.departement || null,
      data.devise || devise.iddevise,
      1,
      data.createdat || today,
      data.createdby || "systeme",
      data.updatedat || null,
      data.updatedby || null,
    );

    const entetedemande = await newEntete.create_enteteDemande();

    if (!entetedemande?.data?.iddemande) {
      throw new DemandeError(
        "ID demande manquant après création",
        "ENTETE_CREATION_FAILED",
      );
    }

    return entetedemande;
  } catch (error) {
    if (error instanceof DemandeError) throw error;
    throw new DemandeError(
      `Erreur création entête: ${error.message}`,
      "ENTETE_ERROR",
    );
  }
}

/**
 * Résout les données budgétaires pour une ligne
 * @param {Object} ligne Lignes de demande
 * @param {Object} societe Objet société
 * @param {Object} filterData Données de filtrage
 * @return {Promise<Object>} Données budgétaires (budget_, preengage, engage, realise)
 */
async function resolveBudgetDataForLine(ligne, societe, filterData) {
  const budgetData = {
    budget_: null,
    preengage: 0,
    engage: 0,
    realise: 0,
  };

  if (societe && societe.data.suivibudgetaire === 1) {
    try {
      // Déterminer le type de budget (analytique ou nature)
      const selectBudget = await lignedemandemodel.checktypebudget(filterData);
      if (selectBudget && selectBudget.length > 0) {
        const budgetPriorise = prioriserBudget(selectBudget);

        if (budgetPriorise.isanalytique && budgetPriorise.isanalytique === 1) {
          // Budget analytique - résolution par centre
          if (ligne.centre) {
            const budgetsAll = await lignedemandemodel.resoleveBudgetcentre({
              ...filterData,
              idcentre: ligne.centre,
              codebudgetaire: ligne.codebudget.codebudgetaire,
              idlignebudget: ligne.codebudget.idbudgetdepartementnature,
            });

            if (budgetsAll && budgetsAll.length > 0) {
              const budgets = prioriserBudget(budgetsAll);
              budgetData.budget_ = budgets.idbudget;
            }

            // Récupérer les valeurs budgétaires en parallèle (toujours par nature pour les calculs)
            const [preengages, engages, realises] = await Promise.all([
              lignedemandemodel.get_engageBycentre(
                ligne.centre,
                filterData.idsite,
                ligne.codebudget.idbudgetdepartementnature,
              ),
              lignedemandemodel.get_engageBycentre(
                ligne.centre,
                filterData.idsite,
                ligne.codebudget.idbudgetdepartementnature,
              ),
              lignedemandemodel.get_realiseBycentre(
                ligne.centre,
                filterData.idsite,
                ligne.codebudget.idbudgetdepartementnature,
              ),
            ]);

            budgetData.preengage = preengages?.[0]?.preengage || 0;
            budgetData.engage = engages?.[0]?.engage || 0;
            budgetData.realise = realises?.[0]?.realise || 0;
          }
        } else {
          // Budget par nature d'opération
          const budgetsAll = await lignedemandemodel.resoleveBudgetnature({
            ...filterData,
            idnature: ligne.natureop,
            codebudgetaire: ligne.codebudget.codebudgetaire,
            idlignebudget: ligne.codebudget.idbudgetdepartementnature,
          });

          if (budgetsAll && budgetsAll.length > 0) {
            const budgets = prioriserBudget(budgetsAll);
            budgetData.budget_ = budgets.idbudget;
          }

          // Récupérer les valeurs budgétaires en parallèle (toujours par nature pour les calculs)
          const [preengage, engage, realise] = await Promise.all([
            lignedemandemodel.get_preengageBynature(
              ligne.natureop,
              filterData.iddepartement,
              ligne.codebudget.idbudgetdepartementnature,
            ),
            lignedemandemodel.get_engageBynature(
              ligne.natureop,
              filterData.iddepartement,
              ligne.codebudget.idbudgetdepartementnature,
            ),
            lignedemandemodel.get_realiseBynature(
              ligne.natureop,
              filterData.iddepartement,
              ligne.codebudget.idbudgetdepartementnature,
            ),
          ]);

          budgetData.preengage = preengage?.[0]?.preengage || 0;
          budgetData.engage = engage?.[0]?.engage || 0;
          budgetData.realise = realise?.[0]?.realise || 0;
        }
      }
    } catch (error) {
      throw new DemandeError(
        `Erreur résolution budget ligne: ${error.message}`,
        "BUDGET_RESOLUTION_ERROR",
      );
    }
  }

  return budgetData;
}

/**
 * Crée les lignes de demande et leurs détails
 * @param {string} idDemande ID de la demande
 * @param {Array} lignes Lignes à créer
 * @param {Object} resources Ressources résolues
 * @param {number} taux Taux de change
 * @param {Object} societe Objet société
 * @param {Object} data Données originales
 * @return {Promise<void>}
 */
async function createDemandeLines(
  idDemande,
  lignes,
  resources,
  taux,
  societe,
  data,
) {
  const { societe: societeObj, site } = resources;

  for (let index = 0; index < lignes.length; index++) {
    const ligne = lignes[index];
    const lineNumber = index + 1;

    try {
      // Résoudre les données budgétaires
      const filterData = {
        idsociete: data.societe || societeObj.data.idsociete,
        idsite: data.site || site.data.idsite,
        iddepartement: data.departement,
        datedemande: data.datedemande,
      };

      const budgetData = await resolveBudgetDataForLine(
        ligne,
        societe,
        filterData,
      );
      const montantref = ligne.montantdemande * taux || ligne.montantdemande;

      // Créer la ligne
      const ligneData = {
        iddemande: idDemande,
        numligne: lineNumber,
        libellelignedemande: data.libelledemande,
        montantdemande: ligne.montantdemande,
        idnature: ligne.natureop,
        idcentre: ligne.centre,
        idtiers: ligne.tiers || null,
        idbudget: budgetData.budget_ || null,
        montantref,
        codebudget: ligne.codebudget.codebudgetaire,
        idlignebudget: ligne.codebudget.idbudgetdepartementnature,
        preengage: budgetData.preengage,
        engage: budgetData.engage,
        realise: budgetData.realise,
        idsociete: data.societe || societeObj.data.idsociete,
        idsite: data.site || site.data.idsite,
        createdby: data.createdby || "system",
      };

      const lignedemande = await lignedemandeservice.create_lignedemande(
        ligneData,
      );

      if (!lignedemande?.idlignedemande) {
        throw new DemandeError(`ID ligne manquant`, "LIGNE_CREATION_FAILED");
      }

      // Créer les détails en parallèle si disponibles
      if (Array.isArray(ligne.details) && ligne.details.length > 0) {
        const detailPromises = ligne.details.map((detail) =>
          detaildemandeservice.create_detaildemande({
            iddemande,
            idlignedemande: lignedemande.idlignedemande,
            idsociete: data.societe || societeObj.data.idsociete,
            description: detail.description,
            quantite: detail.quantite,
            montant: detail.montant,
            createdby: data.createdby || "system",
          }),
        );

        await Promise.all(detailPromises);
      }
    } catch (error) {
      throw new DemandeError(
        `Erreur création ligne ${lineNumber}: ${error.message}`,
        "LINE_CREATION_ERROR",
        { lineIndex: index },
      );
    }
  }
}

/**
 * MÉTHODE PRINCIPALE : Crée une demande de décaissement complète avec tous les contrôles
 * @param {Object} data Données de la demande
 * @return {Promise<Object>} Données de la demande créée
 * @throws {DemandeError} Si une erreur métier survient
 */
async function create_demande(data) {
  const today = new Date();
  const datePeriode = new Date(data.datedemande);

  try {
    // 1. Valider les données initiales
    validateInitialData(data);

    // 2. Résoudre et valider les ressources en parallèle
    const resources = await resolveAndValidateResources(
      data.societe,
      data.site,
      data.devise,
    );
    const { societe, site, devise } = resources;

    // 3. Valider les budgets si applicable
    const filterData = {
      idsociete: data.societe || societe.data.idsociete,
      idsite: data.site || site.data.idsite,
      iddepartement: data.departement,
      datedemande: data.datedemande,
    };

    await validateBudgetsForLines(societe, data.lignes, filterData);

    // 4. Vérifier si budget analytique et centres requis avant création entête
    if (societe && societe.data.suivibudgetaire === 1) {
      try {
        const selectBudget = await lignedemandemodel.checktypebudget(
          filterData,
        );
        if (selectBudget && selectBudget.length > 0) {
          const budgetPriorise = prioriserBudget(selectBudget);
          if (
            budgetPriorise.isanalytique &&
            budgetPriorise.isanalytique === 1
          ) {
            // Vérification finale : tous les centres doivent être renseignés avant création entête
            const lignesSansCentre = data.lignes.filter(
              (ligne) => !ligne.centre,
            );
            if (lignesSansCentre.length > 0) {
              throw new DemandeError(
                "Centre analytique manquant pour certaines lignes en mode budgétaire analytique - création entête annulée",
                "MISSING_CENTRE_ANALYTIQUE_ENTETE",
                {
                  lignesSansCentre: lignesSansCentre.map(
                    (l) => l.numligne || "inconnu",
                  ),
                },
              );
            }
          }
        }
      } catch (error) {
        if (error instanceof DemandeError) throw error;
        throw new DemandeError(
          `Erreur vérification budget analytique: ${error.message}`,
          "BUDGET_ANALYTIQUE_CHECK_ERROR",
        );
      }
    }

    // 5. Générer le numéro de demande
    const numerogenere = await generateDemandeNumber(site, datePeriode);

    // 6. Récupérer le circuit de validation
    const idCircuit = await resolveValidationCircuit(data.site);

    // 7. Créer l'entête de la demande
    const entetedemande = await createEnteteDemande(
      data,
      resources,
      numerogenere,
      idCircuit,
      today,
    );

    // 8. Initialiser les validateurs du circuit
    await initializeCircuitValidators(entetedemande.data.iddemande, idCircuit);

    // 9. Créer les lignes et détails
    await createDemandeLines(
      entetedemande.data.iddemande,
      data.lignes,
      resources,
      data.taux || 1,
      societe,
      data,
    );

    return {
      success: true,
      iddemande: entetedemande.data.iddemande,
      codedemande: numerogenere,
      message: "Demande créée avec succès",
    };
  } catch (error) {
    if (error instanceof DemandeError) {
      throw error;
    }
    // Convertir les erreurs inattendues
    throw new DemandeError(
      `Erreur non gérée: ${error.message}`,
      "UNEXPECTED_ERROR",
      { originalError: error.message },
    );
  }
}

async function getAll({ page, limit, search, status, user }) {
  //Récuperer les data de l'utilisateur connecté
  const userconnect = await userservice.getoneuser(user);

  const result = await demandeModel.get_allDemandes(
    { page, limit, search, status },
    userconnect.data,
  );
  if (!result || result.length === 0) {
    throw new Error("Liste des demandes non chargée");
  }

  try {
    const demandes = {};
    result.data.forEach((row) => {
      const iddemande = row.iddemande;
      //Si la demande n'existe pas encore dans le dictionnaire, on la crée
      if (!demandes[iddemande]) {
        demandes[iddemande] = {
          iddemande: row.iddemande,
          codedemande: row.codedemande,
          typedemande: row.typedemande,
          libelledemande: row.libelledemande,
          datedemande: row.datedemande,
          decaisse: row.decaisse,
          solde: row.solde,
          statut: row.statut,
          idciruit: row.idcircuit,
          circuitExist: row.circuitExist,
          createdat: row.entete_createdat,
          createdby: row.entete_createdby,
          updatedat: row.entete_updatedat,
          updatedby: row.entete_updatedby,
          iddemandeur: row.idutilisateur,
          idsociete: row.idsociete,
          idsite: row.idsite,
          iddevise: row.iddevise,
          demandeur: {
            idutilisateur: row.idutilisateur,
            nom: row.nom,
            prenom: row.prenom,
          },
          devise: {
            iddevise: row.iddevise,
            codedevise: row.codedevise,
          },
          societe: {
            idsociete: row.idsociete,
            codesociete: row.codesociete,
            raisonsociale: row.raisonsociale,
          },
          site: {
            idsite: row.idsite,
            libelle: row.site,
          },
          departement: {
            iddepartement: row.iddepartement,
            codedept: row.codedept,
            libelle: row.libelledept,
          },
          lignes: [],
          _lignesMap: {}, // interne
        };
      }

      const demande = demandes[row.iddemande];

      /* =========================
      LIGNE DEMANDE
      ========================= */

      if (row.idlignedemande) {
        if (!demande._lignesMap[row.idlignedemande]) {
          demande._lignesMap[row.idlignedemande] = {
            idlignedemande: row.idlignedemande,
            numligne: row.numligne,
            libellelignedemande: row.libellelignedemande,
            montantdemande: row.montantdemande,
            natureoperation: {
              id: row.idnatureop,
              libelle: row.natureoperation,
            },
            centreanalytique: {
              id: row.idcentreana,
              libelle: row.centreanalytique,
            },
            details: [],
          };

          demande.lignes.push(demande._lignesMap[row.idlignedemande]);
        }

        const ligne = demande._lignesMap[row.idlignedemande];

        /* =========================
          3️⃣ DÉTAIL DEMANDE
        ========================= */

        if (row.iddetailsdemande) {
          ligne.details.push({
            iddetailsdemande: row.iddetailsdemande,
            quantite: row.quantite,
            montant: row.montant,
            description: row.description,
          });
        }
      }
    });

    /* =========================
     Netoyage des maps internes
    ========================= */
    demandesArray = Object.values(demandes).map((d) => {
      delete d._lignesMap;
      return d;
    });
  } catch (err) {
    throw new Error(err);
  }

  return new PaginationModel(
    result.page,
    result.limit,
    result.total,
    demandesArray,
  );
}

async function get_demande_by_id(iddemande) {
  if (!iddemande) {
    throw new Error("Erreur de donnée");
  }

  try {
    const rows = await demandeModel.get_demande_by_id(iddemande);
    if (!rows || rows.length === 0) {
      throw new Error("Demande introuvable");
    }

    let demande = null;
    const lignesMap = {};

    for (const row of rows) {
      if (!demande) {
        demande = {
          iddemande: row.iddemande,
          codedemande: row.codedemande,
          typedemande: row.typedemande,
          libelledemande: row.libelledemande,
          taux: row.taux,
          datedemande: row.datedemande,
          decaisse: row.decaisse,
          solde: row.solde,
          statut: row.statut,
          createdat: row.entete_createdat,
          updatedat: row.entete_updatedat,
          iddemandeur: row.idutilisateur,
          iddepartement: row.iddepartement,
          idsociete: row.idsociete,
          idsite: row.idsite,
          iddevise: row.iddevise,
          idcircuit: row.circuit_idcircuit,

          demandeur: {
            idutilisateur: row.idutilisateur,
            nom: row.nom,
            prenom: row.prenom,
          },

          devise: {
            iddevise: row.iddevise,
            codedevise: row.codedevise,
          },

          societe: {
            idsociete: row.idsociete,
            codesociete: row.codesociete,
            raisonsociale: row.raisonsociale,
          },

          site: {
            idsite: row.idsite,
            libelle: row.site,
          },
          departement: {
            iddepartement: row.iddepartement,
            codedept: row.codedept,
            libelle: row.libelledept,
          },

          lignes: [],
          totaldemande: 0,
        };
      }

      /* =========================
          2️⃣ LIGNE DEMANDE
      ========================= */
      if (row.idlignedemande) {
        if (!lignesMap[row.idlignedemande]) {
          lignesMap[row.idlignedemande] = {
            idlignedemande: row.idlignedemande,
            numligne: row.numligne,
            libellelignedemande: row.libellelignedemande,
            montantdemande: row.montantdemande,
            totaldetails: 0,
            natureoperation: {
              idnature: row.idnatureop,
              libelle: row.natureoperation,
            },
            centreanalytique: {
              idcentreanalytique: row.idcentreana,
              libelle: row.centreanalytique,
            },
            codebudget: {
              idbudgetdepartementnature: row.idlignebudget,
              codebudgetaire: row.codebudgetaire,
            },
            tiers: {
              idtiers: row.idtiers,
              designation: row.designationtiers,
              codetiers: row.codetiers,
            },
            details: [],
          };

          demande.lignes.push(lignesMap[row.idlignedemande]);
          // total demande = somme des lignes
          demande.totaldemande += row.montantdemande || 0;
        }

        /* =========================
            3️⃣ DÉTAIL DEMANDE
        ========================= */
        if (row.iddetailsdemande) {
          lignesMap[row.idlignedemande].details.push({
            iddetailsdemande: row.iddetailsdemande,
            quantite: row.quantite,
            montant: row.montant,
            description: row.description,
          });

          lignesMap[row.idlignedemande].totaldetails += row.montant || 0;
        }
      }
    }
    return demande;
  } catch (error) {
    throw error;
  }
}

async function update_demande(iddemande, data) {
  if (!iddemande || !data.codedemande) {
    throw new Error("Erreur de données");
  }

  if (!Array.isArray(data.lignes)) {
    throw new Error("Lignes invalides");
  }

  //Récuperer la societe
  let societe = null;
  if (data.societe) {
    societe = await societeservice.getonesociete(data.societe);
  } else {
    throw new Error("Société utilisateur introuvable");
  }

  //Récuperer le site
  let site = null;
  if (data.site) {
    site = await siteservice.getonesite(data.site);
  } else {
    throw new Error("Site utilisateur introuvable");
  }

  //Récuperer la devise
  let devise = null;
  if (data.devise) {
    devise = await deviseservice.getonedevise(data.devise);
  } else {
    throw new Error("Dévise inexistante dans la base");
  }

  /* =====================
      GET ENTÊTE
  ===================== */
  let demande = null;
  demande = await get_demande_by_id(iddemande);
  if (!demande) {
    throw new Error("Demande introuvable");
  }

  if (demande.decaisse == 1) {
    throw new Error("Demande déja decaissée");
  }

  if (demande.decaisse != 1 && Number(demande.statut) === 3) {
    throw new Error(`Erreur modification sur une demande validée`);
  } else {
    // Update entete demande
    await demandeModel.update_enteteDemande(iddemande, data);

    // Réinitialiser le circuit de validation
    await demandeModel.resetCircuitByDemande(iddemande);

    //Recuperer le circuit de validation de la demande
    let circt = null;
    const circuit = await demandeModel.get_circuitValidation(data.site);
    if (circuit && circuit.length != 0) {
      circt = circuit[0].idcircuitvalidation;
    }

    // Recreer le circuit de la demande
    const validateur_circuits = await demandeModel.prepareValidateurCircuit(
      data.circuit,
    );
    if (validateur_circuits || validateur_circuits.length > 0) {
      for (const valid of validateur_circuits) {
        const dataValidation = {
          iddemande: iddemande,
          idcircuitvalidation: valid.idcircuitvalidation,
          idcircuitetape: valid.idcircuitetape,
          user: valid.idutilisateur,
          rang: valid.rang,
        };
        const init = await demandeModel.initValidationDemande(dataValidation);
      }
    }

    /* =====================
      LIGNES
    ===================== */
    let num = 0;
    for (const ligne of data.lignes) {
      num = num + 1;
      let preengage = 0;
      let engage = 0;
      let realise = 0;

      const montantref =
        ligne.montantdemande * data.taux || ligne.montantdemande;

      const dataligne = {
        iddemande,
        libellelignedemande: data.libelledemande,
        montantdemande: ligne.montantdemande,
        idnature: ligne.natureop,
        idcentre: ligne.centre,
        idtiers: ligne.tiers || null,
        montantref: montantref,
        preengage: preengage,
        engage: engage,
        realise: realise,
        idsociete: data.societe,
        idsite: data.site,
        updatedby: data.updatedby || "system",
      };

      let idlignedemande = ligne.idlignedemande;

      if (idlignedemande) {
        try {
          console.log(ligne);
          await lignedemandeservice.update_lignedemande(
            idlignedemande,
            dataligne,
          );
        } catch (error) {
          throw new Error(error);
        }
      } else {
        const newLine = await lignedemandeservice.create_lignedemande(
          dataligne,
        );
        idlignedemande = newLine.idlignedemande;
      }

      if (Array.isArray(ligne.details) && ligne.details.length > 0) {
        for (const detail of ligne.details) {
          const detailLine = {
            iddemande,
            idlignedemande,
            description: detail.description,
            quantite: detail.quantite,
            montant: detail.montant,
            updatedby: data.updatedby || "system",
          };

          let iddetailligne = detail.iddetailsdemande;
          if (iddetailligne) {
            await detaildemandeservice.update_detaildemande(
              iddetailligne,
              detailLine,
            );
          } else {
            await detaildemandeservice.create_detaildemande(detailLine);
          }
        }
      }
    }
  }

  return { success: true };
}

async function delete_demande(iddemande) {
  if (!iddemande) {
    throw new Error("ID Demande requis");
  }

  try {
    const demande_ = await demandeModel.delete_enteteDemande(iddemande);
    if (!demande_.success) {
      throw new Error(demande_.message);
    }
    return demande_;
  } catch (err) {
    throw err;
  }
}

async function get_demandeAvalider(idutilisateur) {
  if (!idutilisateur) {
    throw new Error("ID Utilisateur requis");
  }

  try {
    const demande_ = await demandeModel.getDemandeAvalider(idutilisateur);
    return demande_;
  } catch (err) {
    throw err;
  }
}

async function validate(iddemande, data) {
  if (!iddemande || !data.decision) {
    throw new Error("Aucune donnée reçue");
  }

  if (data.decision === "refuser" && !data.comment) {
    throw new Error("Motif requis");
  }

  if (data.decision === "complement" && !data.comment) {
    throw new Error("Motif requis");
  }

  let demande = null;
  demande = await demandeModel.get_demande_by_id(iddemande);
  if (!demande) {
    throw new Error("Demande introuvable");
  }

  if (demande[0].statut == 3) {
    throw new Error("Demande non validable");
  } else {
    const filtreData = {
      iddemande: demande[0].iddemande,
      iduser: data.userId,
      niveauactuel: demande[0].niveauactuel,
    };
    const droit = await demandeModel.check_doit_user(filtreData);
    if (!droit.length) {
      throw new Error("Vous n'êtes pas autorisé à valider à ce niveau");
    }

    //Mapper la décision utilisateur
    const isAccepted = data.decision === "accepter";

    //Mapper la décision utilisateur
    let reponse = null;
    if (data.decision == "accepter") {
      reponse = "approuve";
    } else if (data.decision == "refuser") {
      reponse = "rejete";
    } else {
      reponse = "revoir";
    }

    const decisionPayload = {
      iddemande: data.iddemande,
      iduser: data.userId,
      motif: data.motif ?? null,
      commentaire: data.comment ?? null,
      decision: reponse,
    };

    //Enregistrer la décision
    await demandeModel.save_decision(decisionPayload);

    //Cas REFUS → rejet immédiat
    if (reponse && reponse == "rejete") {
      await demandeModel.update_statut({
        iddemande: data.iddemande,
        statut: 4, // REJETÉE
      });
      return;
    }

    //Cas COMPLEMENT → complement d'information immédiat
    if (reponse && reponse == "revoir") {
      await demandeModel.update_statut({
        iddemande: data.iddemande,
        statut: 2,
      });
      return;
    }

    //Cas ACCEPTATION
    const { statut, niveauactuel } = demande[0];

    // première validation → EN COURS
    if (statut === 0 || statut === 2) {
      await demandeModel.update_statut({
        iddemande: data.iddemande,
        statut: 1, // EN COURS
      });
    }

    // vérifier si dernier niveau atteint
    const [{ dernierRang }] = await demandeModel.get_dernierniveau(
      data.iddemande,
    );

    if (niveauactuel === dernierRang) {
      // validation finale
      await demandeModel.update_statut({
        iddemande: data.iddemande,
        statut: 3, // VALIDÉE
      });
    } else {
      // passer au niveau suivant
      await demandeModel.augNiveauactuel(data.iddemande);
    }
  }

  return { message: "Demande validée" };
}

function prioriserBudget(budgets) {
  const PRIORITY = {
    Mensuel: 1,
    Annuel: 2,
  };

  return budgets.sort(
    (a, b) => PRIORITY[a.typebudget] - PRIORITY[b.typebudget],
  )[0];
}

async function get_validateurCircuit(iddemande) {
  if (!iddemande) {
    throw new Error("ID demande requis");
  }

  try {
    const demande_ = await demandeModel.get_validateurCircuit(iddemande);
    return demande_;
  } catch (err) {
    throw err;
  }
}

async function get_detailBudget(iddemande) {
  if (!iddemande) {
    throw new Error("ID demande requis");
  }

  let dmd = null;
  let budget_ = 0;

  try {
    const typeBudget_ = await demandeModel.get_demandeBudget(iddemande);
    for (const e of typeBudget_) {
      budget_ = e.isanalytique && e.isanalytique === 1 ? 1 : 0;
    }
  } catch (error) {
    throw error;
  }

  try {
    let demande_ = null;

    if (budget_ === 0) {
      demande_ = await demandeModel.get_detailBudgetnature(iddemande);
    } else {
      demande_ = await demandeModel.get_detailBudgetcentre(iddemande);
    }

    try {
      const demandes = {};
      for (const row of demande_) {
        if (!dmd) {
          // Déterminer le type de budget : analytique ou par nature d'opération
          const budgetType =
            row.isanalytique && row.isanalytique === 1
              ? "analytique"
              : "nature";

          dmd = {
            iddemande: row.iddemande,
            codedemande: row.codedemande,
            datedemande: row.datedemande,
            decaisse: row.decaisse,
            solde: row.solde,
            statut: row.statut,
            idsite: row.idsite,
            iddepartement: row.iddepartement,
            dept_lib: row.dept_libelle,
            codedept: row.codedept,
            codedevise: row.codedevise,
            totaldemande: 0,
            totalref: 0,
            budget: {
              idbudget: row.idbudget,
              codebudget: row.codebudget,
              libelle: row.libelle,
              typebudget: row.typebudget,
              isanalytique: row.isanalytique,
              budgetType: budgetType,
              cloture: row.cloture,
              valide: row.valide,
              datedebut: row.datedebut,
              datefin: row.datefin,
            },
            details: [],
          };
        }

        //Calcule des valeurs budgetaires basées sur le type de budget
        let preengage, engage, realise;

        // Si budget analytique, utiliser les méthodes par centre
        if (dmd.budget.isanalytique === 1) {
          const preengages = await lignedemandemodel.get_preengageBycentre(
            row.idcentre,
            row.idsite,
            row.idlignebudget,
          );
          preengage = preengages?.[0]?.preengage || 0;
          const engages = await lignedemandemodel.get_engageBycentre(
            row.idcentre,
            row.idsite,
            row.idlignebudget,
          );
          engage = engages?.[0]?.engage || 0;
          const realises = await lignedemandemodel.get_realiseBycentre(
            row.idcentre,
            row.idsite,
            row.idlignebudget,
          );
          realise = realises?.[0]?.realise || 0;
        } else {
          // Si budget par nature, utiliser les méthodes par nature
          const preengages = await lignedemandemodel.get_preengageBynature(
            row.idnature,
            row.iddepartement,
            row.idlignebudget,
          );
          preengage = preengages?.[0]?.preengage || 0;
          const engages = await lignedemandemodel.get_engageBynature(
            row.idnature,
            row.iddepartement,
            row.idlignebudget,
          );
          engage = engages?.[0]?.engage || 0;
          const realises = await lignedemandemodel.get_realiseBynature(
            row.idnature,
            row.iddepartement,
            row.idlignebudget,
          );
          realise = realises?.[0]?.realise || 0;
        }

        // Organiser les détails en fonction du type de budget
        if (dmd.budget.isanalytique === 1) {
          // Pour budget analytique, grouper par centre
          if (row.idcentre) {
            if (!demandes[row.idcentre]) {
              demandes[row.idcentre] = {
                idcentre: row.idcentre,
                codecentre: row.codecentre,
                centre_lib: row.centre_lib,
                idnature: row.idnature,
                codenature: row.codenature,
                nature_lib: row.nature_lib,
                codebudgetaire: row.codebudgetaire,
                conso: row.budgetconso,
                preengage: preengage,
                engage: engage,
                realise: realise,
                prevision: row.montantprevisionsociete,
                montant_demande: row.montant_demande,
                montant_ref: row.montant_ref,
              };
              dmd.details.push(demandes[row.idcentre]);
              dmd.totaldemande += row.montant_demande || 0;
              dmd.totalref += row.montant_ref || 0;
            }
          }
        } else {
          // Pour budget par nature, grouper par nature
          if (row.idnature) {
            if (!demandes[row.idnature]) {
              demandes[row.idnature] = {
                idnature: row.idnature,
                codenature: row.codenature,
                nature_lib: row.nature_lib,
                idcentre: row.idcentre,
                codecentre: row.codecentre,
                centre_lib: row.centre_lib,
                codebudgetaire: row.codebudgetaire,
                conso: row.budgetconso,
                preengage: preengage,
                engage: engage,
                realise: realise,
                prevision: row.montantprevisionsociete,
                montant_demande: row.montant_demande,
                montant_ref: row.montant_ref,
              };
              dmd.details.push(demandes[row.idnature]);
              dmd.totaldemande += row.montant_demande || 0;
              dmd.totalref += row.montant_ref || 0;
            }
          }
        }
      }
    } catch (error) {
      throw error;
    }

    return dmd;
  } catch (err) {
    throw err;
  }
}

async function getDernierTaux(deviseorigine, devisedestination, date) {
  if (!deviseorigine || !devisedestination) {
    throw new Error("Données invalides");
  }

  //Récuperer la devise
  let deviseOrigine = null;
  if (deviseorigine) {
    deviseOrigine = await deviseservice.getonedevise(deviseorigine);
  } else {
    throw new Error("Dévise inexistante dans la base");
  }

  let deviseDestinat = null;
  if (deviseorigine) {
    deviseDestinat = await deviseservice.getonedevise(deviseDestinat);
  } else {
    throw new Error("Dévise inexistante dans la base");
  }

  try {
    const result = await demandeModel.getTauxRecent(
      deviseorigine,
      devisedestination,
      date,
    );
    return result;
  } catch (error) {
    throw error;
  }
}

const {
  PieceJointe,
  DemandePieceJointe,
  EnteteDemande,
} = require("../../gestion_pj_demandes/models/index");

/**
 * Upload de fichiers pour une demande
 * @param {string} iddemande - ID de la demande
 * @param {Array} files - Fichiers uploadés (multer)
 * @param {string} userId - ID de l'utilisateur qui upload
 * @returns {Promise<Array>} - Liste des pièces jointes créées
 */
async function uploadFiles(iddemande, files, userId) {
  // 1. Vérifier que la demande existe
  const demande = await get_demande_by_id(iddemande);
  if (!demande) {
    throw new DemandeError("Demande introuvable", "DEMANDE_NOT_FOUND");
  }

  const results = [];
  const transaction = await sequelize.transaction();

  try {
    for (const file of files) {
      // 2. Chemin relatif pour stockage en base
      const relativePath = path
        .join("uploads/demandes", file.filename)
        .replace(/\\/g, "/");

      // 3. Créer l'entrée dans PieceJointe
      const [pieceJointe, created] = await PieceJointe.findOrCreate({
        where: {
          urlpiece: relativePath,
          nomfichier: file.originalname,
        },
        defaults: {
          idpiecejointe: uuidv4(),
          urlpiece: relativePath,
          nomfichier: file.originalname,
          mimetype: file.mimetype,
          taille: file.size,
          nomtable: "EnteteDemande",
          idtable: iddemande,
          dossier: "demandes",
          createdat: new Date(),
          createdby: userId,
        },
        transaction,
      });

      // 4. Vérifier si la liaison existe déjà
      const [liaison, liaisonCreated] = await DemandePieceJointe.findOrCreate({
        where: {
          iddemande: iddemande,
          idpiecejointe: pieceJointe.idpiecejointe,
        },
        defaults: {
          iddemandepiecejointe: uuidv4(),
          iddemande: iddemande,
          idpiecejointe: pieceJointe.idpiecejointe,
          createdat: new Date(),
          createdby: userId,
        },
        transaction,
      });

      results.push({
        idpiecejointe: pieceJointe.idpiecejointe,
        nomfichier: file.originalname,
        urlpiece: relativePath,
        taille: file.size,
        mimetype: file.mimetype,
        alreadyExists: !liaisonCreated,
      });
    }

    await transaction.commit();
    return results;
  } catch (error) {
    await transaction.rollback();

    // Nettoyer les fichiers physiques en cas d'erreur
    for (const file of files) {
      const filePath = path.join(
        process.env.UPLOAD_DIR || "./uploads/demandes",
        file.filename,
      );
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error(
          `Erreur nettoyage fichier ${file.filename}:`,
          unlinkError,
        );
      }
    }

    throw new DemandeError(`Erreur upload: ${error.message}`, "UPLOAD_ERROR");
  }
}

/**
 * Récupère toutes les pièces jointes d'une demande
 * @param {string} iddemande - ID de la demande
 * @returns {Promise<Array>} - Liste des pièces jointes
 */
async function getFiles(iddemande) {
  const demande = await get_demande_by_id(iddemande);
  if (!demande) {
    throw new DemandeError("Demande introuvable", "DEMANDE_NOT_FOUND");
  }

  const piecesJointes = await PieceJointe.findAll({
    include: [
      {
        model: DemandePieceJointe,
        where: { iddemande },
        attributes: [],
        required: true,
      },
    ],
    attributes: [
      "idpiecejointe",
      "urlpiece",
      "nomfichier",
      ["mimetype", "mimetype"],
      "taille",
      "createdat",
      "createdby",
    ],
  });

  return piecesJointes;
}

/**
 * Supprime une pièce jointe d'une demande
 * @param {string} iddemande - ID de la demande
 * @param {string} idpiecejointe - ID de la pièce jointe
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>}
 */
async function deleteFile(iddemande, idpiecejointe, userId) {
  const transaction = await sequelize.transaction();

  try {
    // 1. Vérifier que la liaison existe
    const liaison = await DemandePieceJointe.findOne({
      where: { iddemande, idpiecejointe },
      transaction,
    });

    if (!liaison) {
      throw new DemandeError(
        "Pièce jointe non trouvée pour cette demande",
        "FILE_NOT_FOUND",
      );
    }

    // 2. Récupérer les infos du fichier
    const pieceJointe = await PieceJointe.findByPk(idpiecejointe, {
      transaction,
    });

    if (!pieceJointe) {
      throw new DemandeError("Pièce jointe introuvable", "FILE_NOT_FOUND");
    }

    // 3. Supprimer la liaison
    await liaison.destroy({ transaction });

    // 4. Supprimer l'entrée PieceJointe
    await pieceJointe.destroy({ transaction });

    // 5. Supprimer le fichier physique
    const filePath = path.join(process.cwd(), pieceJointe.urlpiece);
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.error(
        `Erreur suppression fichier physique ${filePath}:`,
        unlinkError,
      );
      // On continue même si le fichier n'existe pas
    }

    await transaction.commit();

    return { success: true, message: "Pièce jointe supprimée avec succès" };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Télécharge un fichier (stream direct)
 * @param {string} urlpiece - Chemin relatif du fichier (ex: uploads/demandes/xxx.pdf)
 * @returns {Promise<{stream: fs.ReadStream, stats: fs.Stats, mimetype: string, nomfichier: string}>}
 */
async function downloadFile(urlpiece) {
  // 1. Construire le chemin absolu
  const absolutePath = path.join(process.cwd(), urlpiece);

  // 2. Vérifier si le fichier existe
  try {
    await fs.access(absolutePath);
  } catch (error) {
    throw new DemandeError(
      `Fichier introuvable: ${urlpiece}`,
      "FILE_NOT_FOUND",
      { urlpiece },
    );
  }

  // 3. Récupérer les stats du fichier
  const stats = await fs.stat(absolutePath);

  // 4. Déterminer le mimetype depuis l'extension (fallback)
  const mimetype = getmimetypeFromExtension(absolutePath);

  // 5. Extraire le nom original depuis l'url (ou depuis la base selon ton besoin)
  const nomfichier =
    path.basename(urlpiece).split("_").slice(2).join("_") ||
    path.basename(urlpiece);

  // 6. Retourner le stream de lecture
  const stream = fs.createReadStream(absolutePath);

  return {
    stream,
    stats,
    mimetype,
    nomfichier,
  };
}

/**
 * Détermine le mimetype depuis l'extension du fichier
 * @param {string} filepath - Chemin du fichier
 * @returns {string}
 */
function getmimetypeFromExtension(filepath) {
  const ext = path.extname(filepath).toLowerCase();
  const mimetypes = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".csv": "text/csv",
    ".txt": "text/plain",
  };
  return mimetypes[ext] || "application/octet-stream";
}
async function downloadFile(urlpiece) {
  // 1. Construire le chemin absolu
  const absolutePath = path.join(process.cwd(), urlpiece);

  // 2. Vérifier si le fichier existe (utiliser fs.promises.access)
  try {
    await fs.promises.access(absolutePath);
  } catch (error) {
    throw new DemandeError(
      `Fichier introuvable: ${urlpiece}`,
      "FILE_NOT_FOUND",
      { urlpiece },
    );
  }

  // 3. Récupérer les stats du fichier (utiliser fs.promises.stat)
  const stats = await fs.promises.stat(absolutePath);

  // 4. Déterminer le mimetype depuis l'extension (fallback)
  const mimetype = getmimetypeFromExtension(absolutePath);

  // 5. Extraire le nom original depuis l'url
  const nomfichier =
    path.basename(urlpiece).split("_").slice(2).join("_") ||
    path.basename(urlpiece);

  // 6. Retourner le stream de lecture (utiliser fs.createReadStream)
  const stream = fs.createReadStream(absolutePath);

  stream.on("error", (err) => {
    console.error("❌ Erreur stream:", err);
  });

  return {
    stream,
    stats,
    mimetype,
    nomfichier,
  };
}

/**
 * Détermine le mimetype depuis l'extension du fichier
 * @param {string} filepath - Chemin du fichier
 * @returns {string}
 */
function getmimetypeFromExtension(filepath) {
  const ext = path.extname(filepath).toLowerCase();
  const mimetypes = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".csv": "text/csv",
    ".txt": "text/plain",
  };
  return mimetypes[ext] || "application/octet-stream";
}

// Télécharger toutes les pièces jointes
const downloadAllFiles = async (iddemande) => {
  const piecesJointes = await getFiles(iddemande);

  if (!piecesJointes || piecesJointes.length === 0) {
    throw new Error("Aucune pièce jointe trouvée pour cette demande");
  }

  // Cas d'un seul fichier
  if (piecesJointes.length === 1) {
    const piece = piecesJointes[0];
    const filePath = path.join(process.cwd(), piece.urlpiece);

    try {
      await fs.access(filePath);
      const fileBuffer = await fs.readFile(filePath);

      return {
        buffer: fileBuffer,
        filename: piece.nomfichier,
        totalFiles: 1,
        isZip: false,
      };
    } catch (err) {
      console.error(`❌ Fichier introuvable: ${filePath}`, err.message);
      throw new Error(`Fichier introuvable: ${piece.nomfichier}`);
    }
  }

  // Cas de plusieurs fichiers → ZIP

  const zip = new AdmZip();
  let addedFiles = 0;

  for (const piece of piecesJointes) {
    const filePath = path.join(process.cwd(), piece.urlpiece);

    try {
      await fs.access(filePath);
      const fileBuffer = await fs.readFile(filePath);
      zip.addFile(piece.nomfichier, fileBuffer);
      addedFiles++;
    } catch (err) {
      console.error(`   ❌ Erreur: ${err.message}`);
    }
  }

  if (addedFiles === 0) {
    throw new Error("Aucun fichier valide n'a pu être ajouté au ZIP");
  }

  const zipBuffer = zip.toBuffer();

  const demandeInfo = await EnteteDemande.findByPk(iddemande, {
    attributes: ["codedemande", "libelledemande"],
  });
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  const filename = `demande_${demandeInfo?.codedemande}_${demandeInfo?.libelledemande}_${timestamp}.zip`;

  return {
    buffer: zipBuffer,
    filename: filename,
    totalFiles: addedFiles,
    isZip: true,
  };
};

module.exports = {
  getAll,
  create_demande,
  get_demande_by_id,
  update_demande,
  delete_demande,
  validate,
  get_demandeAvalider,
  get_validateurCircuit,
  get_detailBudget,
  getDernierTaux,
  DemandeError,
  // Gestion pièces jointes
  uploadFiles,
  getFiles,
  deleteFile,
  downloadFile,
  downloadAllFiles,
};
