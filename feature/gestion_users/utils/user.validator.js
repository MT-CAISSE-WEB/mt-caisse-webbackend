// ❌ SUPPRIMER CETTE LIGNE
// const UserService = require("../services/user_import.service");

const { AppError } = require("../utils/error.middleware");

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  // Au moins 8 caractères, une majuscule, une minuscule, un chiffre, un caractère spécial
  const re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return re.test(password);
};

/**
 * Valider les données d'un utilisateur
 */
const validateUserData = (data) => {
  const errors = [];

  // Champs obligatoires
  if (!data.codeutilisateur) errors.push("Le code utilisateur est requis");
  if (!data.nom) errors.push("Le nom est requis");
  if (!data.prenom) errors.push("Le prénom est requis");
  if (!data.email) errors.push("L'email est requis");
  if (!data.login) errors.push("Le login est requis");
  if (!data.password) errors.push("Le mot de passe est requis");
  if (!data.idsociete) errors.push("La société est requise");

  // Validations spécifiques
  if (data.email && !validateEmail(data.email)) {
    errors.push("L'email n'est pas valide");
  }

  if (data.password && !validatePassword(data.password)) {
    errors.push(
      "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
    );
  }

  // Longueurs
  if (data.codeutilisateur && data.codeutilisateur.length > 24) {
    errors.push("Le code utilisateur ne doit pas dépasser 24 caractères");
  }

  if (data.nom && data.nom.length > 100) {
    errors.push("Le nom ne doit pas dépasser 100 caractères");
  }

  if (data.prenom && data.prenom.length > 100) {
    errors.push("Le prénom ne doit pas dépasser 100 caractères");
  }

  if (data.email && data.email.length > 50) {
    errors.push("L'email ne doit pas dépasser 50 caractères");
  }

  if (data.login && data.login.length > 50) {
    errors.push("Le login ne doit pas dépasser 50 caractères");
  }

  // Types
  if (
    data.typeentitesite !== undefined &&
    ![0, 1].includes(Number(data.typeentitesite))
  ) {
    errors.push("typeentitesite doit être 0 ou 1");
  }

  if (
    data.typeentitedepartement !== undefined &&
    ![0, 1].includes(Number(data.typeentitedepartement))
  ) {
    errors.push("typeentitedepartement doit être 0 ou 1");
  }

  if (
    data.typeentitesociete !== undefined &&
    ![0, 1].includes(Number(data.typeentitesociete))
  ) {
    errors.push("typeentitesociete doit être 0 ou 1");
  }

  if (data.acheteur !== undefined && ![0, 1].includes(Number(data.acheteur))) {
    errors.push("acheteur doit être 0 ou 1");
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      ...data,
      typeentitesite: Number(data.typeentitesite) || 0,
      typeentitedepartement: Number(data.typeentitedepartement) || 0,
      typeentitesociete: Number(data.typeentitesociete) || 0,
      acheteur: Number(data.acheteur) || 0,
    },
  };
};

/**
 * Valider les données pour l'import CSV
 * ✅ Version SANS accès à la base de données
 */
const validateUserImport = async (data) => {
  // ✅ Retourner un objet par défaut même si data est vide
  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      errors: ["Données invalides"],
      data: {},
    };
  }

  const errors = [];
  const validatedData = { ...data };

  // Champs obligatoires
  const required = [
    "codeutilisateur",
    "nom",
    "prenom",
    "email",
    "login",
    "password",
    "codesociete",
  ];

  for (const field of required) {
    if (!data[field] || data[field].trim() === "") {
      errors.push(`Le champ "${field}" est obligatoire`);
    }
  }

  // Validation email
  if (data.email && data.email.trim() !== "" && !validateEmail(data.email)) {
    errors.push(
      `L'email "${data.email}" n'est pas valide (ex: user@example.com)`,
    );
  }

  // Validation mot de passe
  if (
    data.password &&
    data.password.trim() !== "" &&
    !validatePassword(data.password)
  ) {
    errors.push(
      "Le mot de passe doit contenir : 8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial (@$!%*?&)",
    );
  }

  // Conversion des booléens
  const booleanFields = [
    "typeentitesite",
    "typeentitedepartement",
    "typeentitesociete",
    "acheteur",
  ];

  booleanFields.forEach((field) => {
    if (data[field] !== undefined && data[field] !== "") {
      const value = Number(data[field]);
      if (![0, 1].includes(value)) {
        errors.push(
          `"${field}" doit être 0 (Non) ou 1 (Oui), reçu: "${data[field]}"`,
        );
      }
      validatedData[field] = value || 0;
    } else {
      validatedData[field] = 0;
    }
  });

  // ✅ Retourner toujours un objet complet
  return {
    isValid: errors.length === 0,
    errors: errors,
    data: validatedData,
  };
};

module.exports = {
  validateUserData,
  validateUserImport,
  validateEmail,
  validatePassword,
};
