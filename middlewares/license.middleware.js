const licenseService = require("../feature/licence/services/license.service");

const licenseCheckMiddleware = (req, res, next) => {
  // 1. Autoriser uniquement les routes nécessaires à l'activation ou aux fichiers publics
  const allowedPaths = [
    "/api/license/activate",
    "/api/license/status",
    "/public/",
    "/uploads/",
  ];
  if (allowedPaths.some((path) => req.path.startsWith(path))) {
    return next();
  }

  // 2. Validation stricte
  const validation = licenseService.validateLicense();

  if (!validation.valid) {
    // BLOCAGE TOTAL. Renvoie un 403 Forbidden.
    // Le frontend interceptera cela et affichera l'écran de verrouillage.
    return res.status(403).json({
      error: "LICENSE_REQUIRED",
      reason: validation.reason,
      message: validation.message,
    });
  }

  // 3. Si valide, on injecte les infos pour usage éventuel et on laisse passer
  req.licenseInfo = validation.data;
  next();
};

module.exports = licenseCheckMiddleware;
