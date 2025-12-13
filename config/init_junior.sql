

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CircuitValidation')
BEGIN
    CREATE TABLE CircuitValidation (
        idcircuit UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		code NVARCHAR(24) UNIQUE,
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		idsite UNIQUEIDENTIFIER,
		codesite NVARCHAR(50),
		typeentite NVARCHAR(100),
		-- CHECK (typeentite IN ('Site', 'Societe')),
		typeaction NVARCHAR(100),
		-- CHECK (typeaction IN ('Appro Caisse', 'Budget', 'Demande de d�caissement')),
		iddepartement UNIQUEIDENTIFIER,
		codedept NVARCHAR(50),
		actif INT DEFAULT 1,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
		FOREIGN KEY (idsite) REFERENCES Site(idsite),
		FOREIGN KEY (iddepartement) REFERENCES Departement(iddepartement),
    );
END

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CircuitValidateur')
BEGIN
    CREATE TABLE CircuitValidateur (
        idcircuitvalidateur UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codecircuitvalidateur nvarchar(50),
		idutilisateur UNIQUEIDENTIFIER,
		idsociete UNIQUEIDENTIFIER,
		rangvalidation INT,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idutilisateur) REFERENCES Utilisateur(idutilisateur),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );
END


-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ValidationDemande')
BEGIN
    CREATE TABLE ValidationDemande (
		idvalidationdemande UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		iddemande UNIQUEIDENTIFIER,
		codedemande NVARCHAR(50),
		idutilisateur UNIQUEIDENTIFIER,
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		datevalidation DATETIME,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (iddemande) REFERENCES EnteteDemande(iddemande),
		FOREIGN KEY (idutilisateur) REFERENCES Utilisateur(idutilisateur),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );
END
