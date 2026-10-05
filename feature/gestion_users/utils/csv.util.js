const csv = require("csv-parser");
const { Readable } = require("stream");
const { stringify } = require("csv-stringify");

/**
 * Parser un CSV depuis un buffer ou une string
 */
const parseCSV = (data) => {
  return new Promise((resolve, reject) => {
    const results = [];
    let stream;
    let separator = ",";

    // Détecter le séparateur
    const sample = Buffer.isBuffer(data)
      ? data.toString("utf8").split("\n")[0]
      : data.split("\n")[0];

    if (sample && sample.includes(";") && !sample.includes(",")) {
      separator = ";";
    }

    if (Buffer.isBuffer(data)) {
      stream = Readable.from(data);
    } else if (typeof data === "string") {
      stream = Readable.from(data);
    } else {
      reject(new Error("Format de données invalide"));
      return;
    }

    stream
      .pipe(
        csv({
          separator: separator,
          trim: true,
          skip_empty_lines: true,
          skip_lines_with_error: false,
        }),
      )
      .on("data", (row) => {
        const cleanRow = {};
        Object.keys(row).forEach((key) => {
          const cleanKey = key.trim().replace(/[*;,]/g, "");
          cleanRow[cleanKey] = row[key] ? row[key].trim() : "";
        });
        results.push(cleanRow);
      })
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

/**
 * Générer un CSV depuis des données - Version CORRIGÉE
 */
const generateCSV = (data, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        resolve("");
        return;
      }

      const {
        columns = Object.keys(data[0]),
        delimiter = ";",
        header = true,
        quote = true,
      } = options;

      let csvContent = "";

      // Gestion des en-têtes avec support des labels
      if (header) {
        const headers = columns.map((col) => {
          // Si c'est un objet {key, label}, utiliser le label
          const label = typeof col === "object" ? col.label : col;
          // Sinon, formater la clé (ex: "codeUtilisateur" → "Code Utilisateur")
          const displayName =
            typeof label === "string"
              ? label
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())
                  .trim()
              : String(label);
          return quote ? `"${displayName}"` : displayName;
        });
        csvContent += headers.join(delimiter) + "\n";
      }

      // Extraction des données avec support des keys
      for (const row of data) {
        const values = columns.map((col) => {
          const key = typeof col === "object" ? col.key : col; // Utiliser la clé pour accéder à la donnée
          let value =
            row[key] !== undefined && row[key] !== null ? row[key] : "";

          const noTrimFields = ["telephone", "codesociete", "codesite"];
          if (typeof value === "string" && !noTrimFields.includes(key)) {
            value = value.trim();
          }
          // Conversion des types
          if (typeof value === "boolean") value = value ? "1" : "0";
          else if (value instanceof Date)
            value = value.toISOString().split("T")[0];
          else if (typeof value === "number") value = String(value);

          value = String(value);

          // Échappement des guillemets et délimiteurs
          if (
            quote &&
            (value.includes(delimiter) ||
              value.includes('"') ||
              value.includes("\n") ||
              value.includes("\r"))
          ) {
            value = value.replace(/"/g, '""');
            value = `"${value}"`;
          } else if (quote) {
            value = `"${value}"`;
          }
          return value;
        });
        csvContent += values.join(delimiter) + "\n";
      }

      resolve("\uFEFF" + csvContent); // BOM UTF-8 ajouté ici UNIQUEMENT
    } catch (error) {
      console.error("❌ Erreur generateCSV:", error);
      reject(error);
    }
  });
};

module.exports = {
  parseCSV,
  generateCSV,
};
