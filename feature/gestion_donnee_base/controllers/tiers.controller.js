const tiersservice = require("../services/tiers.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

const ExcelJS = require('exceljs');
const puppeteer = require('puppeteer');

/**
 * Liste toutes les tiers OK
 */
module.exports.get_tiers = asyncHandler(async(req, res, next) => {
  try {
    const tiers = await tiersservice.get_all_tiers();
    res.json({ success: true, data: tiers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Un tiers existant par son id
 */ 
// OK
module.exports.get_onetiers = asyncHandler(async(req, res, next) => {
  try {
    const idtiers  = req.params.idtiers;
    const tiers_ = await tiersservice.get_by_idtiers(idtiers);
    res.json({ success: true, data: tiers_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


/**
 * Crée un nouveau tiers
 */
module.exports.create_tiers = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_tiers = await tiersservice.create_tiers(data);
    res.status(201).json({ success: true, data: new_tiers });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
});


/**
 * Met à jour un tiers existant
 */
module.exports.update_tiers = asyncHandler(async(req, res, next) => {
  try {
    const idtiers  = req.params.idtiers;
    const tiers_ = await tiersservice.update_tiers(idtiers, req.body);
    res.json({ success: true, data: tiers_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


/**
 * Supprime un tiers
 */
module.exports.delete_tiers = asyncHandler(async(req, res, next) => {
  try {
    const idtiers = req.params.idtiers;
    const tiers_ = await tiersservice.delete_tiers(idtiers);
    res.json({ success: true, message: "Tiers supprimé avec succès." });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


/**
 * Importer les tiers à partir d'un fichier CSV
 */
module.exports.import_tiers = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({success: false, message: 'Aucun fichier reçu'});
  }
  const info = req.body;
  const result = await tiersservice.import_tiers(req.file.path, info);
  res.status(201).json({success: true, data: result});
});



module.exports.exportTiers = asyncHandler(async (req, res) => {

  const { debut, fin, typetiers, format } = req.body;

  console.log('Export request received with parameters:', { debut, fin, typetiers, format });

  try {
    const data = await tiersservice.exportTiers(debut, fin, typetiers);

    console.log(data);

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
      <td>${d.codetiers}</td>
      <td>${d.designation}</td>
      <td>${d.typetiers}</td>
      <td>${d.actif ? 'Actif' : 'Inactif'}</td>
    </tr>
  `).join('');

  const html = `
    <h3>Liste des tiers</h3>
    <table border="1" cellspacing="0" cellpadding="5">
      <tr>
        <th>Code</th>
        <th>Designation</th>
        <th>Type</th>
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
  const sheet = workbook.addWorksheet('Tiers');

  sheet.columns = [
    { header: 'Code', key: 'codetiers' },
    { header: 'Designation', key: 'designation' },
    { header: 'Type', key: 'typetiers' },
    { header: 'Statut', key: 'actif' }
  ];

  data.forEach(d => {
    sheet.addRow({
      codetiers: d.codetiers,
      designation: d.designation,
      typetiers: d.typetiers,
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