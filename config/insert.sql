-- ============================
-- INSERTION DANS Societe
-- ============================
INSERT INTO Societe (idsociete, codesociete, raisonsociale, sigle, rccm, numNUI, email, telephone, logo, adresse, suivibudgetaire, createdat, createdby, updatedat, updatedby)
VALUES
(NEWID(), 'SOC001', 'Société Alpha', 'ALP', 'RCCM001', 'NUI001', 'contact@alpha.com', '+243810000001', 'logo_alpha.png', 'Avenue Alpha, Kinshasa', 1, GETDATE(), 'admin', null, null),
(NEWID(), 'SOC002', 'Société Beta', 'BET', 'RCCM002', 'NUI002', 'contact@beta.com', '+243810000002', 'logo_beta.png', 'Rue Beta, Kinshasa', 0, GETDATE(), 'admin', null, null),
(NEWID(), 'SOC003', 'Société Gamma', 'GAM', 'RCCM003', 'NUI003', 'contact@gamma.com', '+243810000003', 'logo_gamma.png', 'Boulevard Gamma, Kinshasa', 1, GETDATE(), 'admin', null, null),
(NEWID(), 'SOC004', 'Société Delta', 'DEL', 'RCCM004', 'NUI004', 'contact@delta.com', '+243810000004', 'logo_delta.png', 'Avenue Delta, Kinshasa', 0, GETDATE(), 'admin', null, null);

-- ============================
-- INSERTION DANS Sites
-- ============================
-- On récupère les idsociete pour la cohérence (ici supposés connus)
DECLARE @Societe1 UNIQUEIDENTIFIER = (SELECT idsociete FROM Societe WHERE codesociete='SOC001');
DECLARE @Societe2 UNIQUEIDENTIFIER = (SELECT idsociete FROM Societe WHERE codesociete='SOC002');
DECLARE @Societe3 UNIQUEIDENTIFIER = (SELECT idsociete FROM Societe WHERE codesociete='SOC003');
DECLARE @Societe4 UNIQUEIDENTIFIER = (SELECT idsociete FROM Societe WHERE codesociete='SOC004');

INSERT INTO Sites (idsite, idsociete, codesociete, codesite, libelle, email, telephone, adresse, estcentreanalytique, createdat, createdby, updatedat, updatedby)
VALUES
(NEWID(), @Societe1, 'SOC001', 'SITE001', 'Site Alpha Principal', 'site.alpha@alpha.com', '+243820000001', 'Avenue Alpha 1', 1, GETDATE(), 'admin', null, null),
(NEWID(), @Societe2, 'SOC002', 'SITE002', 'Site Beta Principal', 'site.beta@beta.com', '+243820000002', 'Rue Beta 1', 0, GETDATE(), 'admin', null, null),
(NEWID(), @Societe3, 'SOC003', 'SITE003', 'Site Gamma Principal', 'site.gamma@gamma.com', '+243820000003', 'Boulevard Gamma 1', 1, GETDATE(), 'admin', null, null),
(NEWID(), @Societe4, 'SOC004', 'SITE004', 'Site Delta Principal', 'site.delta@delta.com', '+243820000004', 'Avenue Delta 1', 0, GETDATE(), 'admin', null, null);

-- ============================
-- INSERTION DANS CircuitValidation
-- ============================
-- On récupère idsociete et idsite pour la cohérence
DECLARE @Site1 UNIQUEIDENTIFIER = (SELECT idsite FROM Sites WHERE codesite='SITE001');
DECLARE @Site2 UNIQUEIDENTIFIER = (SELECT idsite FROM Sites WHERE codesite='SITE002');
DECLARE @Site3 UNIQUEIDENTIFIER = (SELECT idsite FROM Sites WHERE codesite='SITE003');
DECLARE @Site4 UNIQUEIDENTIFIER = (SELECT idsite FROM Sites WHERE codesite='SITE004');

INSERT INTO CircuitValidation (idcircuit, code, idsociete, codesociete, idsite, codesite, typeentite, typeaction, codedept, actif, createdat, createdby, updatedat, updatedby)
VALUES
(NEWID(), 'CIR001', @Societe1, 'SOC001', @Site1, 'SITE001', 'Budget', 'Validation', 'FIN', 1, GETDATE(), 'admin', null, null),
(NEWID(), 'CIR002', @Societe2, 'SOC002', @Site2, 'SITE002', 'DemandeDécaissement', 'Validation', 'ACHAT', 1, GETDATE(), 'admin', null, null),
(NEWID(), 'CIR003', @Societe3, 'SOC003', @Site3, 'SITE003', 'Appro Caisse', 'Validation', 'RH', 1, GETDATE(), 'admin', null, null),
(NEWID(), 'CIR004', @Societe4, 'SOC004', @Site4, 'SITE004', 'Budget', 'Validation', 'IT', 1, GETDATE(), 'admin', null, null);



INSERT INTO Departement (
    iddepartement, idsociete, codesociete, idsite, codesite,
    responsable, codedept, libelle, email, telephone, adresse,
    createdat, createdby, updatedat, updatedby
)
VALUES
(
    NEWID(), "35340127-7F9C-48B9-BE21-268C52935684", 'SOC001', "CFC96F78-2CB3-4F68-BEA8-BA6134A2B15A", 'SITE001',
    NEWID(), 'DEP-ADM', 'Administration Générale', 'admin@societe.com', '055000001',
    'Bâtiment A – Rez-de-chaussée',
    GETDATE(), 'system', null, null
),
(
    NEWID(), "35340127-7F9C-48B9-BE21-268C52935684", 'SOC001', "CFC96F78-2CB3-4F68-BEA8-BA6134A2B15A", 'SITE001',
    NEWID(), 'DEP-CPT', 'Comptabilité & Finance', 'compta@societe.com', '055000002',
    'Bâtiment B – 1er étage',
    GETDATE(), 'system', null, null
),
(
    NEWID(), "3E2F4613-4DE8-4DF2-A107-34E51A3A2F97", 'SOC002', "3AC96374-87F5-479F-863D-4D2225B8464C", 'SITE002',
    NULL, 'DEP-RH', 'Ressources Humaines', 'rh@societe.com', '055000003',
    'Bâtiment C – 2e étage',
    GETDATE(), 'system', null, null
),
(
    NEWID(), "3E2F4613-4DE8-4DF2-A107-34E51A3A2F97", 'SOC002', "3AC96374-87F5-479F-863D-4D2225B8464C", 'SITE002',
    NEWID(), 'DEP-INF', 'Informatique & Systèmes', 'it@societe.com', '055000004',
    'Annexe – Salle serveurs',
    GETDATE(), 'system', null, null
);


INSERT INTO NatureOperation (
    idnature, codenature, idsociete, codesociete, idcompte, numcompte,
    libelle, avanceAjustifier, imputationTiers, actif, demandeDecaissement,
    createdat, createdby, updatedat, updatedby
)
VALUES
(
    NEWID(), 'NAT-ACH', '35340127-7F9C-48B9-BE21-268C52935684', 'SOC001', null, '601100',
    'Achat de fournitures', 1, 1, 1, 0,
    GETDATE(), 'system', null, null 
),
(
    NEWID(), 'NAT-SRV', '35340127-7F9C-48B9-BE21-268C52935684', 'SOC001', null, '706200',
    'Prestations de services', 1, 1, 1, 0,
    GETDATE(), 'system', null, null
);

-- Ajout de l'ID à la table BudgetDepNature
ALTER TABLE BudgetDepartementNature
ADD id UNIQUEIDENTIFIER NULL;

UPDATE BudgetDepartementNature
SET id = NEWID()
WHERE id IS NULL;

ALTER TABLE BudgetDepartementNature
ALTER COLUMN id UNIQUEIDENTIFIER NOT NULL;
