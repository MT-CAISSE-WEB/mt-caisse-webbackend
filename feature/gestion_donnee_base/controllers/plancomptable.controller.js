const plancomptableservice = require("../services/plancomptable.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

const ExcelJS = require('exceljs');
const puppeteer = require('puppeteer');


/**
 * Liste toutes les comptes OK
 */
module.exports.get_comptes = asyncHandler(async(req, res, next) => {
  try {
    const comptes = await plancomptableservice.get_all_comptes();
    res.json({ success: true, data: comptes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Un compte existant par son id OK
 */ 
// OK
module.exports.get_onecompte = asyncHandler(async(req, res, next) => {
  try {
    const idcompte  = req.params.idcompte;
    const compte_ = await plancomptableservice.get_by_idcompte(idcompte);
    res.json({ success: true, data: compte_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


/**
 * Crée un nouveau compte
 */
module.exports.create_compte = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_compte = await plancomptableservice.create_compte(data);
    res.status(201).json({ success: true, data: new_compte });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


/**
 * Met à jour un compte existant OK
 */
module.exports.update_compte = asyncHandler(async(req, res, next) => {
  try {
    const idcompte  = req.params.idcompte;
    const compte_ = await plancomptableservice.update_compte(idcompte, req.body);
    res.json({ success: true, data: compte_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});



/**
 * Supprime un compte OK
 */
module.exports.delete_compte = asyncHandler(async(req, res, next) => {
  try {
    const idcompte = req.params.idcompte;
    const compte_ = await plancomptableservice.delete_compte(idcompte);
    res.json({ success: true, message: "Compte supprimé avec succès." });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


/**
 * Importer un plan comptable à partir d'un fichier CSV
 */
module.exports.import_plan_comptable = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({success: false, message: 'Aucun fichier reçu'});
  }
  const info = req.body;
  console.log(info);
  const result = await plancomptableservice.import_plan_comptable(req.file.path, info);
  res.status(201).json({success: true, data: result});
});


// Exporter les comptes

module.exports.exportComptes = asyncHandler(async (req, res) => {

  const { debut, fin, format } = req.body;

  try {
    const data = await plancomptableservice.exportComptes(debut, fin);

    // console.log(data);

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
      <td>${d.numcompte}</td>
      <td>${d.libelle}</td>
      <td>${d.actif ? 'Actif' : 'Inactif'}</td>
    </tr>
  `).join('');

  const html = `
    <h3>Liste des comptes</h3>
    <table border="1" cellspacing="0" cellpadding="5">
      <tr>
        <th>Compte</th>
        <th>Libellé</th>
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
  const sheet = workbook.addWorksheet('Comptes');

  sheet.columns = [
    { header: 'Compte', key: 'numcompte' },
    { header: 'Libellé', key: 'libelle' },
    { header: 'Statut', key: 'actif' }
  ];

  data.forEach(d => {
    sheet.addRow({
      numcompte: d.numcompte,
      libelle: d.libelle,
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
