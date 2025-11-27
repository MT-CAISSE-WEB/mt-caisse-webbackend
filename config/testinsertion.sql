USE MTCAISSEWEB;

-- ============================================
-- 1️⃣ Devise
-- ============================================
DECLARE @Dev1 UNIQUEIDENTIFIER = NEWID();
DECLARE @Dev2 UNIQUEIDENTIFIER = NEWID();
DECLARE @Dev3 UNIQUEIDENTIFIER = NEWID();
DECLARE @Dev4 UNIQUEIDENTIFIER = NEWID();
DECLARE @Dev5 UNIQUEIDENTIFIER = NEWID();
DECLARE @Dev6 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Devise (iddevise, code, intitule, codeIso, actif, createdat, createdby)
VALUES
(@Dev1, 'XAF', 'Franc CFA', 'XAF', 1, GETDATE(), 'ADMIN'),
(@Dev2, 'USD', 'Dollar US', 'USD', 1, GETDATE(), 'ADMIN'),
(@Dev3, 'EUR', 'Euro', 'EUR', 1, GETDATE(), 'ADMIN'),
(@Dev4, 'GBP', 'Livre Sterling', 'GBP', 1, GETDATE(), 'ADMIN'),
(@Dev5, 'JPY', 'Yen', 'JPY', 1, GETDATE(), 'ADMIN'),
(@Dev6, 'CNY', 'Yuan', 'CNY', 1, GETDATE(), 'ADMIN');

-- ============================================
-- 2️⃣ Tauxdevise
-- ============================================
DECLARE @Taux1 UNIQUEIDENTIFIER = NEWID();
DECLARE @Taux2 UNIQUEIDENTIFIER = NEWID();
DECLARE @Taux3 UNIQUEIDENTIFIER = NEWID();
DECLARE @Taux4 UNIQUEIDENTIFIER = NEWID();
DECLARE @Taux5 UNIQUEIDENTIFIER = NEWID();
DECLARE @Taux6 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Tauxdevise (idtauxdevise, iddeviseorigine, iddevisedestination, codetauxdevise, intitule, typecours, datecours, coefficient, coefficientinverse, createdat, createdby)
VALUES
(@Taux1, @Dev1, @Dev2, 'T01', 'USD->EUR', 'Fixe', GETDATE(), 0.93, 1.075, GETDATE(), 'ADMIN'),
(@Taux2, @Dev1, @Dev3, 'T02', 'USD->GBP', 'Fixe', GETDATE(), 0.82, 1.22, GETDATE(), 'ADMIN'),
(@Taux3, @Dev2, @Dev1, 'T03', 'EUR->USD', 'Fixe', GETDATE(), 1.075, 0.93, GETDATE(), 'ADMIN'),
(@Taux4, @Dev3, @Dev1, 'T04', 'GBP->USD', 'Fixe', GETDATE(), 1.22, 0.82, GETDATE(), 'ADMIN'),
(@Taux5, @Dev4, @Dev1, 'T05', 'CDF->USD', 'Fixe', GETDATE(), 0.00051, 1960, GETDATE(), 'ADMIN'),
(@Taux6, @Dev5, @Dev1, 'T06', 'JPY->USD', 'Fixe', GETDATE(), 0.0073, 137, GETDATE(), 'ADMIN');


-- ============================================
-- 2️⃣ Societe
-- ============================================
DECLARE @Soc1 UNIQUEIDENTIFIER = NEWID();
DECLARE @Soc2 UNIQUEIDENTIFIER = NEWID();
DECLARE @Soc3 UNIQUEIDENTIFIER = NEWID();
DECLARE @Soc4 UNIQUEIDENTIFIER = NEWID();
DECLARE @Soc5 UNIQUEIDENTIFIER = NEWID();
DECLARE @Soc6 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Societe (idsociete, codesociete, iddevisereference, codedevisereference, iddevisereporting, codedevisereporting, raisonsociale, sigle, rccm, numNUI, email, telephone, logo, adresse, suivibudgetaire, createdat, createdby)
VALUES
(@Soc1, 'SOC001', @Dev1, 'XAF', @Dev2, 'USD', 'Société Alpha', 'ALPHA', 'RCCM001', 'NUI001', 'alpha@societe.com', '1234567890', 'logo1.png', 'Rue 1', 1, GETDATE(), 'ADMIN'),
(@Soc2, 'SOC002', @Dev2, 'USD', @Dev2, 'USD', 'Société Beta', 'BETA', 'RCCM002', 'NUI002', 'beta@societe.com', '0987654321', 'logo2.png', 'Rue 2', 1, GETDATE(), 'ADMIN'),
(@Soc3, 'SOC003', @Dev3, 'EUR', @Dev1, 'XAF', 'Société Gamma', 'GAMMA', 'RCCM003', 'NUI003', 'gamma@societe.com', '111222333', 'logo3.png', 'Rue 3', 1, GETDATE(), 'ADMIN'),
(@Soc4, 'SOC004', @Dev4, 'GBP', @Dev4, 'GBP', 'Société Delta', 'DELTA', 'RCCM004', 'NUI004', 'delta@societe.com', '222333444', 'logo4.png', 'Rue 4', 1, GETDATE(), 'ADMIN'),
(@Soc5, 'SOC005', @Dev5, 'JPY', @Dev5, 'JPY', 'Société Epsilon', 'EPSI', 'RCCM005', 'NUI005', 'epsilon@societe.com', '333444555', 'logo5.png', 'Rue 5', 1, GETDATE(), 'ADMIN'),
(@Soc6, 'SOC006', @Dev6, 'CNY', @Dev6, 'CNY', 'Société Zeta', 'ZETA', 'RCCM006', 'NUI006', 'zeta@societe.com', '444555666', 'logo6.png', 'Rue 6', 1, GETDATE(), 'ADMIN');

-- ============================================
-- 3️⃣ Utilisateur (6 par société)
-- ============================================
DECLARE @U1 UNIQUEIDENTIFIER = NEWID();
DECLARE @U2 UNIQUEIDENTIFIER = NEWID();
DECLARE @U3 UNIQUEIDENTIFIER = NEWID();
DECLARE @U4 UNIQUEIDENTIFIER = NEWID();
DECLARE @U5 UNIQUEIDENTIFIER = NEWID();
DECLARE @U6 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Utilisateur (idutilisateur, code, nom, prenom, adresse, telephone, email, idsociete, codesociete, createdat, createdby)
VALUES
(@U1, 'U001', 'Dupont', 'Jean', 'Adresse 1', '+242063122312', 'jean.dupont@mail.com', @Soc1, 'SOC001', GETDATE(), 'ADMIN'),
(@U2, 'U002', 'Martin', 'Anne', 'Adresse 2', '+242069033344', 'anne.martin@mail.com', @Soc1, 'SOC001', GETDATE(), 'ADMIN'),
(@U3, 'U003', 'Bernard', 'Paul', 'Adresse 3','+242058555666', 'paul.bernard@mail.com', @Soc1, 'SOC001', GETDATE(), 'ADMIN'),
(@U4, 'U004', 'Leroy', 'Claire', 'Adresse 4','+2420600777888', 'claire.leroy@mail.com', @Soc2, 'SOC002', GETDATE(), 'ADMIN'),
(@U5, 'U005', 'Moreau', 'Luc', 'Adresse 5', '600999000', 'luc.moreau@mail.com', @Soc2, 'SOC002', GETDATE(), 'ADMIN'),
(@U6, 'U006', 'Fabre', 'Sophie', 'Adresse 6', '601111222', 'sophie.fabre@mail.com', @Soc2, 'SOC002', GETDATE(), 'ADMIN');

-- ============================================
-- 4️⃣ PlanComptable
-- ============================================
DECLARE @PC1 UNIQUEIDENTIFIER = NEWID();
DECLARE @PC2 UNIQUEIDENTIFIER = NEWID();
DECLARE @PC3 UNIQUEIDENTIFIER = NEWID();
DECLARE @PC4 UNIQUEIDENTIFIER = NEWID();
DECLARE @PC5 UNIQUEIDENTIFIER = NEWID();
DECLARE @PC6 UNIQUEIDENTIFIER = NEWID();
DECLARE @PC7 UNIQUEIDENTIFIER = NEWID();
DECLARE @PC8 UNIQUEIDENTIFIER = NEWID();

INSERT INTO PlanComptable (idcompte, idsociete, numcompte, libelle, ventillable, auxiliaire, actif, createdat, createdby)
VALUES
(@PC1, @Soc1, '5710301', 'Caisse', 1, 1, 1, GETDATE(), 'ADMIN'),
(@PC2, @Soc1, '6042109', 'Consommables de bureau', 1, 1, 1, GETDATE(), 'ADMIN'),
(@PC3, @Soc1, '6230110', 'Achats services', 1, 1, 1, GETDATE(), 'ADMIN'),
(@PC4, @Soc2, '5730011', 'Fournisseurs', 1, 1, 1, GETDATE(), 'ADMIN'),
(@PC5, @Soc3, '5740800', 'Salaires', 1, 1, 1, GETDATE(), 'ADMIN'),
(@PC6, @Soc1, '5729000', 'Charges diverses', 1, 1, 1, GETDATE(), 'ADMIN');

-- ============================================
-- 5️⃣ NatureOperation
-- ============================================
DECLARE @NO1 UNIQUEIDENTIFIER = NEWID();
DECLARE @NO2 UNIQUEIDENTIFIER = NEWID();
DECLARE @NO3 UNIQUEIDENTIFIER = NEWID();
DECLARE @NO4 UNIQUEIDENTIFIER = NEWID();
DECLARE @NO5 UNIQUEIDENTIFIER = NEWID();
DECLARE @NO6 UNIQUEIDENTIFIER = NEWID();

INSERT INTO NatureOperation (idnature, codenature, idsociete, idcompte, libelle, avanceAjustifier, imputationTiers, actif, demandeDecaissement, createdat, createdby)
VALUES
(@NO1, 'NAT001', @Soc1, @PC2, 'Achat eau fontaines', 0, 0, 1, 1, GETDATE(), 'ADMIN'),
(@NO2, 'NAT002', @Soc1, @PC2, 'Achat service nettoyage', 0, 0, 1, 0, GETDATE(), 'ADMIN'),
(@NO3, 'NAT003', @Soc1, @PC2, 'Achat fournitures bureau', 0, 0, 1, 1, GETDATE(), 'ADMIN'),
(@NO4, 'NAT004', @Soc1, @PC2, 'Achat consommables bureau', 0, 0, 1, 1, GETDATE(), 'ADMIN'),
(@NO5, 'NAT005', @Soc3, @PC5, 'Achat à justifier', 1, 1, 1, 0, GETDATE(), 'ADMIN'),
(@NO6, 'NAT006', @Soc1, @PC3, 'Achat electricité', 1, 1, 1, 0, GETDATE(), 'ADMIN');

-- ============================================
-- 6️⃣ Tiers
-- ============================================
DECLARE @T1 UNIQUEIDENTIFIER = NEWID();
DECLARE @T2 UNIQUEIDENTIFIER = NEWID();
DECLARE @T3 UNIQUEIDENTIFIER = NEWID();
DECLARE @T4 UNIQUEIDENTIFIER = NEWID();
DECLARE @T5 UNIQUEIDENTIFIER = NEWID();
DECLARE @T6 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Tiers (idtiers, codetiers, idsociete, designation, typetiers, actif, createdat, createdby)
VALUES
(@T1, 'TI001', @Soc1, 'Client A', 'CLIENT', 1, GETDATE(), 'ADMIN'),
(@T2, 'TI002', @Soc1, 'Client B', 'CLIENT', 1, GETDATE(), 'ADMIN'),
(@T3, 'TI003', @Soc1, 'Fournisseur A', 'FOURNISSEUR', 1, GETDATE(), 'ADMIN'),
(@T4, 'TI004', @Soc1, 'Fournisseur B', 'FOURNISSEUR', 1, GETDATE(), 'ADMIN'),
(@T5, 'TI005', @Soc1, 'Client C', 'CLIENT', 1, GETDATE(), 'ADMIN'),
(@T6, 'TI006', @Soc1, 'Fournisseur C', 'FOURNISSEUR', 1, GETDATE(), 'ADMIN');

-- ============================================
-- 7️⃣ Journal
-- ============================================
DECLARE @J1 UNIQUEIDENTIFIER = NEWID();
DECLARE @J2 UNIQUEIDENTIFIER = NEWID();
DECLARE @J3 UNIQUEIDENTIFIER = NEWID();
DECLARE @J4 UNIQUEIDENTIFIER = NEWID();
DECLARE @J5 UNIQUEIDENTIFIER = NEWID();
DECLARE @J6 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Journal (idjournal, codejournal, idsociete, designation, actif, createdat, createdby)
VALUES
(@J1, 'J001', @Soc1, 'Journal Caisse', 1, GETDATE(), 'ADMIN'),
(@J2, 'J002', @Soc1, 'Journal Banque', 1, GETDATE(), 'ADMIN'),
(@J3, 'J003', @Soc2, 'Journal Ventes', 1, GETDATE(), 'ADMIN'),
(@J4, 'J004', @Soc2, 'Journal Achats', 1, GETDATE(), 'ADMIN'),
(@J5, 'J005', @Soc3, 'Journal Salaires', 1, GETDATE(), 'ADMIN'),
(@J6, 'J006', @Soc3, 'Journal Divers', 1, GETDATE(), 'ADMIN');

-- ============================================
-- 8️⃣ Caisse
-- ============================================
DECLARE @C1 UNIQUEIDENTIFIER = NEWID();
DECLARE @C2 UNIQUEIDENTIFIER = NEWID();
DECLARE @C3 UNIQUEIDENTIFIER = NEWID();
DECLARE @C4 UNIQUEIDENTIFIER = NEWID();
DECLARE @C5 UNIQUEIDENTIFIER = NEWID();
DECLARE @C6 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Caisse (idcaisse, codecaisse, libelle, idjournal, iddevise, idsite, idsociete, idcompte, actif, createdat, createdby)
VALUES
(@C1, 'CA001', 'Caisse principale', @J1, @Dev1, NULL, @Soc1, @PC1, 1, GETDATE(), 'ADMIN'),
(@C2, 'CA002', 'Caisse secondaire', @J2, @Dev2, NULL, @Soc1, @PC6, 1, GETDATE(), 'ADMIN'),
(@C3, 'CA003', 'Caisse clients', @J3, @Dev3, NULL, @Soc2, @PC3, 1, GETDATE(), 'ADMIN'),
(@C4, 'CA004', 'Caisse fournisseurs', @J4, @Dev4, NULL, @Soc2, @PC4, 1, GETDATE(), 'ADMIN'),
(@C5, 'CA005', 'Caisse salaires', @J5, @Dev5, NULL, @Soc3, @PC5, 1, GETDATE(), 'ADMIN'),
(@C6, 'CA006', 'Caisse divers', @J6, @Dev6, NULL, @Soc3, @PC6, 1, GETDATE(), 'ADMIN');

-- ============================================
-- 9️⃣ UtilisateurCaisse
-- ============================================
INSERT INTO UtilisateurCaisse (idcaisse, codecaisse, idutilisateur, idsociete, actif, createdat, createdby)
VALUES
(@C1, 'CA001', @U1, @Soc1, 1, GETDATE(), 'ADMIN'),
(@C2, 'CA002', @U2, @Soc1, 1, GETDATE(), 'ADMIN'),
(@C3, 'CA003', @U3, @Soc2, 1, GETDATE(), 'ADMIN'),
(@C4, 'CA004', @U4, @Soc2, 1, GETDATE(), 'ADMIN'),
(@C5, 'CA005', @U5, @Soc3, 1, GETDATE(), 'ADMIN'),
(@C6, 'CA006', @U6, @Soc3, 1, GETDATE(), 'ADMIN');

-- ============================================
-- 🔟 Compteurs (exemple initialisation)
-- ============================================
INSERT INTO Compteurs (prefixe, annee, mois, jour, compteur, createdat, createdby)
VALUES
('OP', 2025, 1, 1, 0, GETDATE(), 'ADMIN'),
('OP', 2025, 1, 2, 0, GETDATE(), 'ADMIN'),
('OP', 2025, 1, 3, 0, GETDATE(), 'ADMIN'),
('OP', 2025, 1, 4, 0, GETDATE(), 'ADMIN'),
('OP', 2025, 1, 5, 0, GETDATE(), 'ADMIN'),
('OP', 2025, 1, 6, 0, GETDATE(), 'ADMIN');

-- ============================================
-- 11️⃣ Sites
-- ============================================
DECLARE @S1 UNIQUEIDENTIFIER = NEWID();
DECLARE @S2 UNIQUEIDENTIFIER = NEWID();
DECLARE @S3 UNIQUEIDENTIFIER = NEWID();
DECLARE @S4 UNIQUEIDENTIFIER = NEWID();
DECLARE @S5 UNIQUEIDENTIFIER = NEWID();
DECLARE @S6 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Sites (idsite, idsociete, idcentreanalytique, codeanalytique, libelle, email, telephone, adresse, estcentreanalytique, createdat, createdby)
VALUES
(@S1, @Soc1, NULL, 'CA001', 'Site Alpha', 'alpha@site.com', '600111222', 'Rue A', 0, GETDATE(), 'ADMIN'),
(@S2, @Soc1, NULL, 'CA002', 'Site Beta', 'beta@site.com', '600333444', 'Rue B', 0, GETDATE(), 'ADMIN'),
(@S3, @Soc2, NULL, 'CA003', 'Site Gamma', 'gamma@site.com', '600555666', 'Rue C', 0, GETDATE(), 'ADMIN'),
(@S4, @Soc2, NULL, 'CA004', 'Site Delta', 'delta@site.com', '600777888', 'Rue D', 0, GETDATE(), 'ADMIN'),
(@S5, @Soc3, NULL, 'CA005', 'Site Epsilon', 'epsilon@site.com', '600999000', 'Rue E', 0, GETDATE(), 'ADMIN'),
(@S6, @Soc3, NULL, 'CA006', 'Site Zeta', 'zeta@site.com', '601111222', 'Rue F', 0, GETDATE(), 'ADMIN');

-- ============================================
-- 12️⃣ Departement
-- ============================================
DECLARE @D1 UNIQUEIDENTIFIER = NEWID();
DECLARE @D2 UNIQUEIDENTIFIER = NEWID();
DECLARE @D3 UNIQUEIDENTIFIER = NEWID();
DECLARE @D4 UNIQUEIDENTIFIER = NEWID();
DECLARE @D5 UNIQUEIDENTIFIER = NEWID();
DECLARE @D6 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Departement (iddepartement, idsociete, idsite, codedept, libelle, email, telephone, adresse, createdat, createdby)
VALUES
(@D1, @Soc1, @S1, 'D001', 'Département Alpha', 'alpha@dep.com', '600111222', 'Adresse 1', GETDATE(), 'ADMIN'),
(@D2, @Soc1, @S2, 'D002', 'Département Beta', 'beta@dep.com', '600333444', 'Adresse 2', GETDATE(), 'ADMIN'),
(@D3, @Soc2, @S3, 'D003', 'Département Gamma', 'gamma@dep.com', '600555666', 'Adresse 3', GETDATE(), 'ADMIN'),
(@D4, @Soc2, @S4, 'D004', 'Département Delta', 'delta@dep.com', '600777888', 'Adresse 4', GETDATE(), 'ADMIN'),
(@D5, @Soc3, @S5, 'D005', 'Département Epsilon', 'epsilon@dep.com', '600999000', 'Adresse 5', GETDATE(), 'ADMIN'),
(@D6, @Soc3, @S6, 'D006', 'Département Zeta', 'zeta@dep.com', '601111222', 'Adresse 6', GETDATE(), 'ADMIN');

-- ============================================
-- 13️⃣ CentreAnalytique
-- ============================================
DECLARE @CA1 UNIQUEIDENTIFIER = NEWID();
DECLARE @CA2 UNIQUEIDENTIFIER = NEWID();
DECLARE @CA3 UNIQUEIDENTIFIER = NEWID();
DECLARE @CA4 UNIQUEIDENTIFIER = NEWID();
DECLARE @CA5 UNIQUEIDENTIFIER = NEWID();
DECLARE @CA6 UNIQUEIDENTIFIER = NEWID();

INSERT INTO CentreAnalytique (idcentreanalytique, idsociete, code, libelle, actif, createdat, createdby)
VALUES
(@CA1, @Soc1, 'CA001', 'Agriculture', 1, GETDATE(), 'ADMIN'),
(@CA2, @Soc1, 'CA002', 'Informatique', 1, GETDATE(), 'ADMIN'),
(@CA3, @Soc2, 'CA003', 'Usine', 1, GETDATE(), 'ADMIN'),
(@CA4, @Soc2, 'CA004', 'Administration générale', 1, GETDATE(), 'ADMIN'),
(@CA5, @Soc3, 'CA005', 'Consultant', 1, GETDATE(), 'ADMIN'),
(@CA6, @Soc3, 'CA006', 'Frais de mission', 1, GETDATE(), 'ADMIN');

-- ============================================
-- 1️⃣ AffectationAnalytique
-- ============================================
DECLARE @AA1 UNIQUEIDENTIFIER = NEWID();
DECLARE @AA2 UNIQUEIDENTIFIER = NEWID();
DECLARE @AA3 UNIQUEIDENTIFIER = NEWID();
DECLARE @AA4 UNIQUEIDENTIFIER = NEWID();
DECLARE @AA5 UNIQUEIDENTIFIER = NEWID();
DECLARE @AA6 UNIQUEIDENTIFIER = NEWID();

INSERT INTO AffectationAnalytique (idaffectation, idsociete, idsite, iddepartement, idcentre, idnature, actif, createdat, createdby)
VALUES
(@AA1, @Soc1, @S1, @Dept1, @CA1, @NO1, 1, GETDATE(), 'ADMIN'),
(@AA2, @Soc1, @S2, @Dept2, @CA2, @NO2, 1, GETDATE(), 'ADMIN'),
(@AA3, @Soc2, @S3, @Dept1, @CA3, @NO3, 1, GETDATE(), 'ADMIN'),
(@AA4, @Soc2, @S4, @Dept2, @CA4, @NO4, 1, GETDATE(), 'ADMIN'),
(@AA5, @Soc1, @S2, @Dept1, @CA5, @NO5, 1, GETDATE(), 'ADMIN'),
(@AA6, @Soc2, @S4, @Dept2, @CA6, @NO6, 1, GETDATE(), 'ADMIN');
