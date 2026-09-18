const express = require("express");
const router = express.Router();
const licenseService = require("../services/license.service");

// Vérifie l'état actuel (pour l'affichage frontend)
router.get("/status", async (req, res) => {
  try {
    const validation = await licenseService.validateLicense();
    res.json(validation);
  } catch (error) {
    res.status(500).json({
      error: "Erreur lors de la vérification",
      message: error.message,
    });
  }
});

// Active la licence via le JSON
router.post("/activate", async (req, res) => {
  try {
    const licenseData = req.body;
    const result = await licenseService.activateLicense(licenseData);
    res.json(result);
  } catch (error) {
    res
      .status(400)
      .json({ error: "ACTIVATION_FAILED", message: error.message });
  }
});

// Supprime la licence actuelle
router.delete("/", async (req, res) => {
  try {
    const result = licenseService.removeLicense();
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: "DELETE_FAILED", message: error.message });
  }
});

module.exports = router;
