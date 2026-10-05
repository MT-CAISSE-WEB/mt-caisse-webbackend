const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

class AuthService {
  /**
   * Hasher un mot de passe avec Argon2
   */
  static async hashPassword(password) {
    try {
      // Configuration optimale pour Argon2
      const hash = await argon2.hash(password, {
        type: argon2.argon2id, // Le plus sécurisé
        memoryCost: 65536, // 64 MB (recommandé pour production)
        timeCost: 3, // 3 itérations
        parallelism: 4, // 4 threads
        saltLength: 16, // Longueur du sel
        hashLength: 32, // Longueur du hash
      });
      return hash;
    } catch (error) {
      throw new Error("Erreur lors du hashage du mot de passe");
    }
  }

  /**
   * Vérifier un mot de passe avec Argon2
   */
  static async verifyPassword(hash, password) {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      throw new Error("Erreur lors de la vérification du mot de passe");
    }
  }

  /**
   * Générer un token JWT
   */
  static generateToken(user) {
    return jwt.sign(
      {
        idutilisateur: user.idutilisateur,
        email: user.email,
        login: user.login,
        nom: user.nom,
        prenom: user.prenom,
        roles: user.roles ? user.roles.split(",") : [],
        permissions: user.permissions || [],
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
    );
  }

  /**
   * Vérifier un token JWT
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error("Token invalide ou expiré");
    }
  }

  /**
   * Générer un refresh token
   */
  static generateRefreshToken(user) {
    return jwt.sign(
      { idutilisateur: user.idutilisateur },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );
  }
}

module.exports = AuthService;
