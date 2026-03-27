const banqueservice = require("../services/banque.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");


const ExcelJS = require('exceljs');
const puppeteer = require('puppeteer');

/**
 * Liste toutes les banques d'opération OK
 */
// OK
module.exports.get_banques = asyncHandler(async(req, res, next) => {
  try {
    const banques = await banqueservice.get_all_banques();
    res.json({ success: true, data: banques });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});


/**
 * Un banque existant par son id
 */ 
// OK
module.exports.get_onebanque = asyncHandler(async(req, res, next) => {
  try {
    const idbanque  = req.params.idbanque;
    const banque_ = await banqueservice.get_by_idbanque(idbanque);
    res.json({ success: true, data: banque_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


/**
 * Crée un nouveau banque
 */
module.exports.create_banque = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    console.log(data);
    const new_banque = await banqueservice.create_banque(data);
    res.status(201).json({ success: true, data: new_banque });
  } catch (error) {
    console.log(error)
    res.status(400).json({ success: false, message: error.message });
  }
});


/**
 * Met à jour un banque existant
 */
module.exports.update_banque = asyncHandler(async(req, res, next) => {
  try {
    const idbanque  = req.params.idbanque;
    const banque_ = await banqueservice.update_banque(idbanque, req.body);
    res.json({ success: true, data: banque_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});



/**
 * Supprime un banque
 */
module.exports.delete_banque = asyncHandler(async(req, res, next) => {
  try {
    const idbanque = req.params.idbanque;
    const banque_ = await banqueservice.delete_banque(idbanque);
    res.json({ success: true, message: "Banque supprimée avec succès." });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


/**
 * Importer un plan comptable à partir d'un fichier CSV
 */
module.exports.import_banque = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({success: false, message: 'Aucun fichier reçu'});
  }
  const info = req.body;
  const result = await banqueservice.import_banque(req.file.path, info);
  res.status(201).json({success: true, data: result});
});




module.exports.exportbanques = asyncHandler(async (req, res) => {

  const { debut, fin, format } = req.body;

  try {
    const data = await banqueservice.exportbanques(debut, fin);

    if (format === 'excel') {
      return exportExcel(data, res);
    } else {
      return exportPDF(data, res);
    }

  } catch (err) {
    console.log(err.message)
    res.status(500).json({
      success: false,
      message: err.message
    });
}});

async function exportPDF(data, res) {

  const rows = data.map(d => `
    <tr>
      <td>${d.codebanque}</td>
      <td>${d.libelle}</td>
      <td>${d.numerocompte}</td>
      <td>${d.iban}</td>
      <td>${d.swift}</td>
      <td>${d.devise_code}</td>
      <td>${d.numcompte}</td>
      <td>${d.actif ? 'Actif' : 'Inactif'}</td>
    </tr>
  `).join('');

  const html = `
    <h3>Liste des banques</h3>
    <table border="1" cellspacing="0" cellpadding="5">
      <tr>
        <th>Code</th>
        <th>Libellé</th>
        <th>Numéro de compte</th>
        <th>IBAN</th>
        <th>SWIFT</th>
        <th>Devise</th>
        <th>Compte</th>
        <th>Statut</th>
      </tr>
      ${rows}
    </table>
  `;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html);

  const pdf = await page.pdf({ format: 'A4' });

  await browser.close();

  res.setHeader('Content-Type', 'application/pdf');
  res.send(pdf);
}

async function exportExcel(data, res) {

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Banques');

  sheet.columns = [
    { header: 'Code', key: 'codebanque' },
    { header: 'Libellé', key: 'libelle' },
    { header: 'Numéro de compte bancaire', key: 'numerocompte' },
    { header: 'IBAN', key: 'iban' },
    { header: 'SWIFT', key: 'swift' },
    { header: 'Devise', key: 'devise_code' },
    { header: 'Compte', key: 'numcompte' },
    { header: 'Statut', key: 'actif' }
  ];

  data.forEach(d => {
    sheet.addRow({
      codebanque: d.codebanque,
      libelle: d.libelle,
      numerocompte: d.numerocompte,
      iban: d.iban,
      swift: d.swift,
      devise_code: d.devise_code,
      numcompte: d.numcompte,
      actif: d.actif ? 'Actif' : 'Inactif'
    });
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  await workbook.xlsx.write(res);
  res.end();
}