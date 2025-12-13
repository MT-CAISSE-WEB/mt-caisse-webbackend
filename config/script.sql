CREATE OR ALTER PROCEDURE GenererNumeroOperation
    @prefixe NVARCHAR(10),
    @annee INT,
    @mois INT,
    @jour INT,
    @numero NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @compteur INT;

    BEGIN TRANSACTION;

    -- Créer compteur si inexistant pour le jour donné
    IF NOT EXISTS (
        SELECT 1 
        FROM Compteurs 
        WHERE prefixe = @prefixe 
          AND annee = @annee 
          AND mois = @mois 
          AND jour = @jour
    )
    BEGIN
        INSERT INTO Compteurs(prefixe, annee, mois, jour, compteur)
        VALUES(@prefixe, @annee, @mois, @jour, 0);
    END

    -- Incrémenter le compteur atomiquement
    UPDATE Compteurs
    SET compteur = compteur + 1
    WHERE prefixe = @prefixe 
      AND annee = @annee 
      AND mois = @mois 
      AND jour = @jour;

    -- Récupérer le compteur actuel
    SELECT @compteur = compteur
    FROM Compteurs
    WHERE prefixe = @prefixe 
      AND annee = @annee 
      AND mois = @mois 
      AND jour = @jour;

    COMMIT TRANSACTION;

    -- Format final : prefixe-YYYY-MM-DD-xxx
    SET @numero = 
        @prefixe + '-' 
        + RIGHT('0000' + CAST(@annee AS NVARCHAR), 4) + '-' 
        + RIGHT('00' + CAST(@mois AS NVARCHAR), 2) + '-' 
        + RIGHT('00' + CAST(@jour AS NVARCHAR), 2) + '-' 
        + RIGHT('000' + CAST(@compteur AS NVARCHAR), 3);
END
