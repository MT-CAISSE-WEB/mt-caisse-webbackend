const {
  create_demande,
  DemandeError
} = require('./entetedemande.service');

// Mock les services
jest.mock('../../gestion_organisation/services/societe.service');
jest.mock('../../gestion_organisation/services/site.service');
jest.mock('../../gestion_organisation/services/devise.service');
jest.mock('../../gestion_paramètres/services/compteur.service');
jest.mock('../models/entetedemande.model');
jest.mock('../services/ligendemande.service');
jest.mock('../services/detaildemande.service');
jest.mock('../../gestion_users/services/users.service');
jest.mock('../models/lignedemande.model');
jest.mock('../../gestion_operation_caisse/models/enteteoperation.model');

const societeService = require('../../gestion_organisation/services/societe.service');
const siteService = require('../../gestion_organisation/services/site.service');
const deviseService = require('../../gestion_organisation/services/devise.service');
const compteurService = require('../../gestion_paramètres/services/compteur.service');
const enteteDemandeModel = require('../models/entetedemande.model');
const lignedemandeService = require('../services/ligendemande.service');
const detaildemandeService = require('../services/detaildemande.service');
const lignedemandeModel = require('../models/lignedemande.model');
const enteteoperation = require('../../gestion_operation_caisse/models/enteteoperation.model');

describe('Service entetedemande', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // TESTS DE VALIDATION DES DONNÉES D'ENTRÉE
  // ==========================================
  
  describe('create_demande - Validation des données initiales', () => {
    
    test('Doit rejeter une demande sans données', async () => {
      await expect(create_demande(null)).rejects.toThrow(DemandeError);
    });

    test('Doit rejeter une demande sans lignes', async () => {
      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        datedemande: '2026-03-31',
        lignes: []
      };
      
      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({
          code: 'NO_LINES',
          message: expect.stringContaining('Au moins une ligne')
        })
      );
    });

    test('Doit rejeter une demande sans societe', async () => {
      const data = {
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, details: [] }]
      };
      
      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({ code: 'NO_SOCIETE' })
      );
    });

    test('Doit rejeter une demande sans site', async () => {
      const data = {
        societe: 'soc1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, details: [] }]
      };
      
      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({ code: 'NO_SITE' })
      );
    });

    test('Doit rejeter une demande sans devise', async () => {
      const data = {
        societe: 'soc1',
        site: 'site1',
        demandeur: 'user1',
        typedemande: 'normal',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, details: [] }]
      };
      
      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({ code: 'NO_DEVISE' })
      );
    });

    test('Doit rejeter une demande avec montant invalide', async () => {
      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: -500, details: [] }]
      };
      
      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({ code: 'INVALID_MONTANT' })
      );
    });

    test('Doit rejeter une demande avec date invalide', async () => {
      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        datedemande: 'not-a-date',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, details: [] }]
      };
      
      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({ code: 'INVALID_DATE' })
      );
    });

    test('Doit rejeter une ligne sans nature opération', async () => {
      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        datedemande: '2026-03-31',
        lignes: [{ montantdemande: 1000, details: [] }]
      };
      
      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({ code: 'LINE_NO_NATURE' })
      );
    });
  });

  // ==========================================
  // TESTS DE VALIDATION BUDGÉTAIRE
  // ==========================================

  describe('create_demande - Validation budgétaire', () => {

    test('Doit rejeter si budget analytique et centres vides', async () => {
      // Société avec suivi budgétaire
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 1 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });

      // Budget analytique trouvé
      lignedemandeModel.checktypebudget = jest.fn().mockResolvedValue([
        { idbudget: 'bud1', typebudget: 'Mensuel', isanalytique: 1 }
      ]);

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        datedemande: '2026-03-31',
        departement: 'dept1',
        lignes: [
          { natureop: 'nat1', montantdemande: 1000, centre: null, details: [] }, // Centre vide
          { natureop: 'nat2', montantdemande: 2000, centre: '', details: [] }    // Centre vide
        ]
      };

      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({
          code: 'MISSING_CENTRE_ANALYTIQUE_ENTETE',
          message: expect.stringContaining('Centre analytique manquant')
        })
      );

      // Vérifier que l'entête n'a pas été créée
      expect(enteteDemandeModel.prototype.create_enteteDemande).not.toHaveBeenCalled();
      // Vérifier que le numéro n'a pas été généré
      expect(enteteoperation.prototype.create_numoperation).not.toHaveBeenCalled();
    });

    test('Doit accepter si budget analytique et tous centres fournis', async () => {
      // Société avec suivi budgétaire
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 1 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });

      // Budget analytique trouvé
      lignedemandeModel.checktypebudget = jest.fn().mockResolvedValue([
        { idbudget: 'bud1', typebudget: 'Mensuel', isanalytique: 1 }
      ]);

      // Budgets par centre trouvés
      lignedemandeModel.resoleveBudgetcentre = jest.fn().mockResolvedValue([
        { idbudget: 'bud1', typebudget: 'Mensuel' }
      ]);

      // Solde budgétaire OK
      lignedemandeModel.checkBudgetcentreSolde = jest.fn().mockResolvedValue(true);

      // Configuration compteur
      compteurService.getall.mockResolvedValue({
        data: [{ typedocument: 'demande', sequence_1: 'site', prefixe_1: '', sequence_2: 'constante', prefixe_2: 'DEM' }]
      });
      enteteoperation.prototype.create_numoperation = jest.fn().mockResolvedValue('S001DEM001');

      // Création entête
      enteteDemandeModel.prototype.create_enteteDemande = jest.fn().mockResolvedValue({
        data: { iddemande: 'dem1' }
      });

      // Création ligne
      lignedemandeService.create_lignedemande = jest.fn().mockResolvedValue({
        idlignedemande: 'ligne1'
      });

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        libelledemande: 'Test',
        datedemande: '2026-03-31',
        departement: 'dept1',
        lignes: [
          { natureop: 'nat1', montantdemande: 1000, centre: 'centre1', details: [] },
          { natureop: 'nat2', montantdemande: 2000, centre: 'centre2', details: [] }
        ]
      };

      const result = await create_demande(data);

      expect(result.success).toBe(true);
      expect(lignedemandeModel.checkBudgetcentreSolde).toHaveBeenCalledTimes(2);
    });
  });

  // ==========================================
  // TESTS DE RÉSOLUTION DES RESSOURCES
  // ==========================================

  describe('create_demande - Résolution des ressources', () => {
    
    test('Doit résoudre les ressources en parallèle', async () => {
      // Préparation
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 0 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });
      compteurService.getall.mockResolvedValue({
        data: [{ typedocument: 'demande', sequence_1: 'site', prefixe_1: '', sequence_2: 'constante', prefixe_2: 'DEM' }]
      });
      enteteoperation.prototype.create_numoperation = jest.fn().mockResolvedValue('S001DEM001');
      enteteDemandeModel.prototype.create_enteteDemande = jest.fn().mockResolvedValue({
        data: { iddemande: 'dem1' }
      });

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        libelledemande: 'Test',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, centre: 'center1', details: [] }]
      };

      const result = await create_demande(data);
      
      expect(result.success).toBe(true);
      expect(result.iddemande).toBe('dem1');
      expect(societeService.getonesociete).toHaveBeenCalledWith('soc1');
      expect(siteService.getonesite).toHaveBeenCalledWith('site1');
      expect(deviseService.getonedevise).toHaveBeenCalledWith('devise1');
    });

    test('Doit rejeter si société introuvable', async () => {
      societeService.getonesociete.mockResolvedValue(null);
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });

      const data = {
        societe: 'soc_inexistant',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, details: [] }]
      };

      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({ code: 'SOCIETE_NOT_FOUND' })
      );
    });

    test('Doit rejeter si site introuvable', async () => {
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 0 }
      });
      siteService.getonesite.mockResolvedValue(null);
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });

      const data = {
        societe: 'soc1',
        site: 'site_inexistant',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, details: [] }]
      };

      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({ code: 'SITE_NOT_FOUND' })
      );
    });

    test('Doit rejeter si devise introuvable', async () => {
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 0 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue(null);

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise_inexistant',
        demandeur: 'user1',
        typedemande: 'normal',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, details: [] }]
      };

      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({ code: 'DEVISE_NOT_FOUND' })
      );
    });
  });

  // ==========================================
  // TESTS DE GÉNÉRATION DU NUMÉRO
  // ==========================================

  describe('create_demande - Génération du numéro', () => {
    
    test('Doit générer un numéro avec séquence site', async () => {
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 0 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });
      compteurService.getall.mockResolvedValue({
        data: [{ typedocument: 'demande', sequence_1: 'site', prefixe_1: '', sequence_2: 'constante', prefixe_2: 'DEM' }]
      });
      enteteoperation.prototype.create_numoperation = jest.fn().mockResolvedValue('S001DEM001');
      enteteDemandeModel.prototype.create_enteteDemande = jest.fn().mockResolvedValue({
        data: { iddemande: 'dem1' }
      });

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        libelledemande: 'Test',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, centre: 'center1', details: [] }]
      };

      const result = await create_demande(data);
      
      expect(result.codedemande).toBe('S001DEM001');
    });

    test('Doit rejeter si compteur introuvable', async () => {
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 0 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });
      compteurService.getall.mockResolvedValue({
        data: []
      });

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, details: [] }]
      };

      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({ code: 'COMPTEUR_CONFIG_NOT_FOUND' })
      );
    });
  });

  // ==========================================
  // TESTS DE CRÉATION DE L'ENTÊTE
  // ==========================================

  describe('create_demande - Création entête', () => {
    
    test('Doit créer l\'entête avec statut par défaut', async () => {
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 0 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });
      compteurService.getall.mockResolvedValue({
        data: [{ typedocument: 'demande', sequence_1: 'site', prefixe_1: '', sequence_2: 'constante', prefixe_2: 'DEM' }]
      });
      enteteoperation.prototype.create_numoperation = jest.fn().mockResolvedValue('S001DEM001');
      enteteDemandeModel.prototype.create_enteteDemande = jest.fn().mockResolvedValue({
        data: { iddemande: 'dem1' }
      });

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        libelledemande: 'Test',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, centre: 'center1', details: [] }]
      };

      const result = await create_demande(data);
      
      expect(result.success).toBe(true);
    });

    test('Doit rejeter si création entête échoue', async () => {
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 0 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });
      compteurService.getall.mockResolvedValue({
        data: [{ typedocument: 'demande', sequence_1: 'site', prefixe_1: '', sequence_2: 'constante', prefixe_2: 'DEM' }]
      });
      enteteoperation.prototype.create_numoperation = jest.fn().mockResolvedValue('S001DEM001');
      enteteDemandeModel.prototype.create_enteteDemande = jest.fn().mockResolvedValue({
        data: {} // Pas de iddemande
      });

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        libelledemande: 'Test',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, centre: 'center1', details: [] }]
      };

      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({ code: 'ENTETE_CREATION_FAILED' })
      );
    });
  });

  // ==========================================
  // TESTS DE CRÉATION DES LIGNES
  // ==========================================

  describe('create_demande - Création des lignes', () => {
    
    test('Doit créer les lignes et détails correctement', async () => {
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 0 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });
      compteurService.getall.mockResolvedValue({
        data: [{ typedocument: 'demande', sequence_1: 'site', prefixe_1: '', sequence_2: 'constante', prefixe_2: 'DEM' }]
      });
      enteteoperation.prototype.create_numoperation = jest.fn().mockResolvedValue('S001DEM001');
      enteteDemandeModel.prototype.create_enteteDemande = jest.fn().mockResolvedValue({
        data: { iddemande: 'dem1' }
      });
      lignedemandeService.create_lignedemande = jest.fn().mockResolvedValue({
        idlignedemande: 'ligne1'
      });
      detaildemandeService.create_detaildemande = jest.fn().mockResolvedValue({
        iddetail: 'detail1'
      });

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        libelledemande: 'Test',
        datedemande: '2026-03-31',
        taux: 1,
        lignes: [{
          natureop: 'nat1',
          montantdemande: 1000,
          centre: 'center1',
          details: [
            { description: 'Detail 1', quantite: 10, montant: 500 },
            { description: 'Detail 2', quantite: 10, montant: 500 }
          ]
        }]
      };

      const result = await create_demande(data);
      
      expect(lignedemandeService.create_lignedemande).toHaveBeenCalled();
      expect(detaildemandeService.create_detaildemande).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });

    test('Doit créer plusieurs lignes correctement', async () => {
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 0 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });
      compteurService.getall.mockResolvedValue({
        data: [{ typedocument: 'demande', sequence_1: 'site', prefixe_1: '', sequence_2: 'constante', prefixe_2: 'DEM' }]
      });
      enteteoperation.prototype.create_numoperation = jest.fn().mockResolvedValue('S001DEM001');
      enteteDemandeModel.prototype.create_enteteDemande = jest.fn().mockResolvedValue({
        data: { iddemande: 'dem1' }
      });
      lignedemandeService.create_lignedemande = jest.fn()
        .mockResolvedValueOnce({ idlignedemande: 'ligne1' })
        .mockResolvedValueOnce({ idlignedemande: 'ligne2' });
      detaildemandeService.create_detaildemande = jest.fn().mockResolvedValue({
        iddetail: 'detail1'
      });

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        libelledemande: 'Test',
        datedemande: '2026-03-31',
        taux: 1,
        lignes: [
          { natureop: 'nat1', montantdemande: 1000, centre: 'center1', details: [{ description: 'D1', quantite: 10, montant: 1000 }] },
          { natureop: 'nat2', montantdemande: 2000, centre: 'center2', details: [{ description: 'D2', quantite: 20, montant: 2000 }] }
        ]
      };

      const result = await create_demande(data);
      
      expect(lignedemandeService.create_lignedemande).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });
  });

  // ==========================================
  // TESTS DE VALIDATION BUDGÉTAIRE
  // ==========================================

  describe('create_demande - Validation budgétaire', () => {
    
    test('Doit rejeter si budget analytique et centres vides', async () => {
      // Société avec suivi budgétaire
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 1 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });

      // Budget analytique trouvé
      lignedemandeModel.checktypebudget = jest.fn().mockResolvedValue([
        { idbudget: 'bud1', typebudget: 'Mensuel', isanalytique: 1 }
      ]);

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        datedemande: '2026-03-31',
        departement: 'dept1',
        lignes: [
          { natureop: 'nat1', montantdemande: 1000, centre: null, details: [] }, // Centre vide
          { natureop: 'nat2', montantdemande: 2000, centre: '', details: [] }    // Centre vide
        ]
      };

      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({
          code: 'MISSING_CENTRE_ANALYTIQUE_ENTETE',
          message: expect.stringContaining('Centre analytique manquant')
        })
      );

      // Vérifier que l'entête n'a pas été créée
      expect(enteteDemandeModel.prototype.create_enteteDemande).not.toHaveBeenCalled();
    });

    test('Doit accepter si budget analytique et tous centres fournis', async () => {
      // Société avec suivi budgétaire
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 1 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });

      // Budget analytique trouvé
      lignedemandeModel.checktypebudget = jest.fn().mockResolvedValue([
        { idbudget: 'bud1', typebudget: 'Mensuel', isanalytique: 1 }
      ]);

      // Budgets par centre trouvés
      lignedemandeModel.resoleveBudgetcentre = jest.fn().mockResolvedValue([
        { idbudget: 'bud1', typebudget: 'Mensuel' }
      ]);

      // Solde budgétaire OK
      lignedemandeModel.checkBudgetcentreSolde = jest.fn().mockResolvedValue(true);

      // Configuration compteur
      compteurService.getall.mockResolvedValue({
        data: [{ typedocument: 'demande', sequence_1: 'site', prefixe_1: '', sequence_2: 'constante', prefixe_2: 'DEM' }]
      });
      enteteoperation.prototype.create_numoperation = jest.fn().mockResolvedValue('S001DEM001');

      // Création entête
      enteteDemandeModel.prototype.create_enteteDemande = jest.fn().mockResolvedValue({
        data: { iddemande: 'dem1' }
      });

      // Création ligne
      lignedemandeService.create_lignedemande = jest.fn().mockResolvedValue({
        idlignedemande: 'ligne1'
      });

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        libelledemande: 'Test',
        datedemande: '2026-03-31',
        departement: 'dept1',
        lignes: [
          { natureop: 'nat1', montantdemande: 1000, centre: 'centre1', details: [] },
          { natureop: 'nat2', montantdemande: 2000, centre: 'centre2', details: [] }
        ]
      };

      const result = await create_demande(data);
      
      expect(result.success).toBe(true);
      expect(lignedemandeModel.checkBudgetcentreSolde).toHaveBeenCalledTimes(2);
    });
  });
    
    test('Doit créer une demande sans validation budgétaire si société non suivie', async () => {
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 0 } // Pas de suivi budgétaire
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });
      compteurService.getall.mockResolvedValue({
        data: [{ typedocument: 'demande', sequence_1: 'site', prefixe_1: '', sequence_2: 'constante', prefixe_2: 'DEM' }]
      });
      enteteoperation.prototype.create_numoperation = jest.fn().mockResolvedValue('S001DEM001');
      enteteDemandeModel.prototype.create_enteteDemande = jest.fn().mockResolvedValue({
        data: { iddemande: 'dem1' }
      });

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        libelledemande: 'Test',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, centre: 'center1', details: [] }]
      };

      const result = await create_demande(data);
      
      expect(result.success).toBe(true);
      expect(lignedemandeModel.checktypebudget).not.toHaveBeenCalled();
    });

    test('Doit rejeter si aucun budget valide trouvé', async () => {
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 1 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });
      lignedemandeModel.checktypebudget = jest.fn().mockResolvedValue([]);

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, centre: 'center1', details: [] }]
      };

      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({ code: 'NO_VALID_BUDGET' })
      );
    });

    test('Doit valider budget analytique par centre', async () => {
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 1 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });
      compteurService.getall.mockResolvedValue({
        data: [{ typedocument: 'demande', sequence_1: 'site', prefixe_1: '', sequence_2: 'constante', prefixe_2: 'DEM' }]
      });
      enteteoperation.prototype.create_numoperation = jest.fn().mockResolvedValue('S001DEM001');
      enteteDemandeModel.prototype.create_enteteDemande = jest.fn().mockResolvedValue({
        data: { iddemande: 'dem1' }
      });

      // Budget analytique
      lignedemandeModel.checktypebudget = jest.fn().mockResolvedValue([
        { idbudget: 'bud1', typebudget: 'Mensuel', isanalytique: 1 }
      ]);
      lignedemandeModel.resoleveBudgetcentre = jest.fn().mockResolvedValue([
        { idbudget: 'bud1', typebudget: 'Mensuel' }
      ]);
      lignedemandeModel.checkBudgetcentreSolde = jest.fn().mockResolvedValue(true);

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        libelledemande: 'Test',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, centre: 'center1', details: [] }]
      };

      const result = await create_demande(data);
      
      expect(result.success).toBe(true);
      expect(lignedemandeModel.resoleveBudgetcentre).toHaveBeenCalledWith(
        expect.objectContaining({ idcentre: 'center1' })
      );
      expect(lignedemandeModel.checkBudgetcentreSolde).toHaveBeenCalled();
    });

    test('Doit rejeter si centre analytique manquant en mode budgétaire analytique', async () => {
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 1 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });

      // Budget analytique
      lignedemandeModel.checktypebudget = jest.fn().mockResolvedValue([
        { idbudget: 'bud1', typebudget: 'Mensuel', isanalytique: 1 }
      ]);

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, details: [] }] // Pas de centre
      };

      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({ code: 'MISSING_CENTRE_ANALYTIQUE_ENTETE' })
      );
    });

    test('Doit valider budget par nature d\'opération', async () => {
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 1 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });
      compteurService.getall.mockResolvedValue({
        data: [{ typedocument: 'demande', sequence_1: 'site', prefixe_1: '', sequence_2: 'constante', prefixe_2: 'DEM' }]
      });
      enteteoperation.prototype.create_numoperation = jest.fn().mockResolvedValue('S001DEM001');
      enteteDemandeModel.prototype.create_enteteDemande = jest.fn().mockResolvedValue({
        data: { iddemande: 'dem1' }
      });

      // Budget par nature
      lignedemandeModel.checktypebudget = jest.fn().mockResolvedValue([
        { idbudget: 'bud1', typebudget: 'Mensuel', isanalytique: 0 }
      ]);
      lignedemandeModel.resoleveBudgetnature = jest.fn().mockResolvedValue([
        { idbudget: 'bud1', typebudget: 'Mensuel' }
      ]);
      lignedemandeModel.checkBudgetnatureSolde = jest.fn().mockResolvedValue(true);

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        libelledemande: 'Test',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, centre: 'center1', details: [] }]
      };

      const result = await create_demande(data);
      
      expect(result.success).toBe(true);
      expect(lignedemandeModel.resoleveBudgetnature).toHaveBeenCalledWith(
        expect.objectContaining({ idnature: 'nat1' })
      );
      expect(lignedemandeModel.checkBudgetnatureSolde).toHaveBeenCalled();
    });

    test('Doit rejeter si solde budgétaire insuffisant pour centre analytique', async () => {
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 1 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });

      // Budget analytique avec solde insuffisant
      lignedemandeModel.checktypebudget = jest.fn().mockResolvedValue([
        { idbudget: 'bud1', typebudget: 'Mensuel', isanalytique: 1 }
      ]);
      lignedemandeModel.resoleveBudgetcentre = jest.fn().mockResolvedValue([
        { idbudget: 'bud1', typebudget: 'Mensuel' }
      ]);
      lignedemandeModel.checkBudgetcentreSolde = jest.fn().mockResolvedValue(false);

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, centre: 'center1', details: [] }]
      };

      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({ code: 'INSUFFICIENT_BUDGET_CENTRE' })
      );
    });

    test('Doit rejeter si solde budgétaire insuffisant pour nature', async () => {
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 1 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });

      // Budget par nature avec solde insuffisant
      lignedemandeModel.checktypebudget = jest.fn().mockResolvedValue([
        { idbudget: 'bud1', typebudget: 'Mensuel', isanalytique: 0 }
      ]);
      lignedemandeModel.resoleveBudgetnature = jest.fn().mockResolvedValue([
        { idbudget: 'bud1', typebudget: 'Mensuel' }
      ]);
      lignedemandeModel.checkBudgetnatureSolde = jest.fn().mockResolvedValue(false);

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        datedemande: '2026-03-31',
        lignes: [{ natureop: 'nat1', montantdemande: 1000, centre: 'center1', details: [] }]
      };

      await expect(create_demande(data)).rejects.toThrow(
        expect.objectContaining({ code: 'INSUFFICIENT_BUDGET_NATURE' })
      );
    });

    test('Doit traiter plusieurs lignes avec budgets différents en parallèle', async () => {
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 1 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });
      compteurService.getall.mockResolvedValue({
        data: [{ typedocument: 'demande', sequence_1: 'site', prefixe_1: '', sequence_2: 'constante', prefixe_2: 'DEM' }]
      });
      enteteoperation.prototype.create_numoperation = jest.fn().mockResolvedValue('S001DEM001');
      enteteDemandeModel.prototype.create_enteteDemande = jest.fn().mockResolvedValue({
        data: { iddemande: 'dem1' }
      });

      // Ligne 1: Budget analytique
      // Ligne 2: Budget par nature
      lignedemandeModel.checktypebudget = jest.fn()
        .mockResolvedValueOnce([{ idbudget: 'bud1', typebudget: 'Mensuel', isanalytique: 1 }])
        .mockResolvedValueOnce([{ idbudget: 'bud2', typebudget: 'Mensuel', isanalytique: 0 }]);
      
      lignedemandeModel.resoleveBudgetcentre = jest.fn().mockResolvedValue([
        { idbudget: 'bud1', typebudget: 'Mensuel' }
      ]);
      lignedemandeModel.checkBudgetcentreSolde = jest.fn().mockResolvedValue(true);
      
      lignedemandeModel.resoleveBudgetnature = jest.fn().mockResolvedValue([
        { idbudget: 'bud2', typebudget: 'Mensuel' }
      ]);
      lignedemandeModel.checkBudgetnatureSolde = jest.fn().mockResolvedValue(true);

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        libelledemande: 'Test',
        datedemande: '2026-03-31',
        lignes: [
          { natureop: 'nat1', montantdemande: 1000, centre: 'center1', details: [] },
          { natureop: 'nat2', montantdemande: 2000, centre: 'center2', details: [] }
        ]
      };

      const result = await create_demande(data);
      
      expect(result.success).toBe(true);
      expect(lignedemandeModel.checktypebudget).toHaveBeenCalledTimes(2);
      expect(lignedemandeModel.resoleveBudgetcentre).toHaveBeenCalledTimes(1);
      expect(lignedemandeModel.resoleveBudgetnature).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================
  // TESTS D'INTÉGRATION
  // ==========================================

  describe('create_demande - Intégration complète', () => {
    
    test('Doit créer une demande complète avec succès', async () => {
      societeService.getonesociete.mockResolvedValue({
        data: { idsociete: 'soc1', suivibudgetaire: 0 }
      });
      siteService.getonesite.mockResolvedValue({
        data: { idsite: 'site1', codesite: 'S001' }
      });
      deviseService.getonedevise.mockResolvedValue({
        iddevise: 'devise1'
      });
      compteurService.getall.mockResolvedValue({
        data: [{ typedocument: 'demande', sequence_1: 'site', prefixe_1: '', sequence_2: 'constante', prefixe_2: 'DEM' }]
      });
      enteteoperation.prototype.create_numoperation = jest.fn().mockResolvedValue('S001DEM001');
      enteteDemandeModel.prototype.create_enteteDemande = jest.fn().mockResolvedValue({
        data: { iddemande: 'dem1' }
      });
      lignedemandeService.create_lignedemande = jest.fn().mockResolvedValue({
        idlignedemande: 'ligne1'
      });
      detaildemandeService.create_detaildemande = jest.fn().mockResolvedValue({
        iddetail: 'detail1'
      });

      const data = {
        societe: 'soc1',
        site: 'site1',
        devise: 'devise1',
        demandeur: 'user1',
        typedemande: 'normal',
        libelledemande: 'Demande de test complète',
        datedemande: '2026-03-31',
        taux: 1.2,
        createdby: 'testuser',
        lignes: [{
          natureop: 'nat1',
          montantdemande: 5000,
          centre: 'center1',
          tiers: 'tier1',
          details: [
            { description: 'Article 1', quantite: 50, montant: 2500 },
            { description: 'Article 2', quantite: 50, montant: 2500 }
          ]
        }]
      };

      const result = await create_demande(data);
      
      expect(result).toEqual({
        success: true,
        iddemande: 'dem1',
        codedemande: 'S001DEM001',
        message: 'Demande créée avec succès'
      });
    });
  });

  // ==========================================
  // TESTS DE LA CLASSE DemandeError
  // ==========================================

  describe('DemandeError', () => {
    
    test('Doit créer une instance de DemandeError correctement', () => {
      const error = new DemandeError('Test error', 'TEST_CODE', { field: 'value' });
      
      expect(error).toBeInstanceOf(DemandeError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ field: 'value' });
      expect(error.name).toBe('DemandeError');
    });

    test('Doit utiliser des valeurs par défaut pour code et details', () => {
      const error = new DemandeError('Test error 2');
      
      expect(error.code).toBe('DEMANDE_ERROR');
      expect(error.details).toEqual({});
    });

    test('Doit capturer la stack trace', () => {
      const error = new DemandeError('Test error 3', 'TEST_CODE');
      
      expect(error.stack).toContain('DemandeError');
    });
  });
