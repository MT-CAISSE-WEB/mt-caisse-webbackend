const natureoperationservice = require("../services/natureoperation.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");


const ExcelJS = require('exceljs');
const puppeteer = require('puppeteer');

/**
 * Liste toutes les natures d'opération OK
 */
// OK
module.exports.get_natures = asyncHandler(async(req, res, next) => {
  try {
    const natures = await natureoperationservice.get_all_natures();
    res.json({ success: true, data: natures });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});


/**
 * Un nature existant par son id
 */ 
// OK
module.exports.get_onenature = asyncHandler(async(req, res, next) => {
  try {
    const idnature  = req.params.idnature;
    const nature_ = await natureoperationservice.get_by_idnature(idnature);
    res.json({ success: true, data: nature_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


/**
 * Crée un nouveau nature
 */
module.exports.create_nature = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_nature = await natureoperationservice.create_nature(data);
    res.status(201).json({ success: true, data: new_nature });
  } catch (error) {
    console.log(error)
    res.status(400).json({ success: false, message: error.message });
  }
});


/**
 * Met à jour un nature existant
 */
module.exports.update_nature = asyncHandler(async(req, res, next) => {
  try {
    const idnature  = req.params.idnature;
    const nature_ = await natureoperationservice.update_nature(idnature, req.body);
    res.json({ success: true, data: nature_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});



/**
 * Supprime un nature
 */
module.exports.delete_nature = asyncHandler(async(req, res, next) => {
  try {
    const idnature = req.params.idnature;
    const nature_ = await natureoperationservice.delete_nature(idnature);
    res.json({ success: true, message: "Nature supprimée avec succès." });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


/**
 * Importer un plan comptable à partir d'un fichier CSV
 */
module.exports.import_nature = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({success: false, message: 'Aucun fichier reçu'});
  }
  const info = req.body;
  const result = await natureoperationservice.import_nature(req.file.path, info);
  res.status(201).json({success: true, data: result});
});




module.exports.exportNatures = asyncHandler(async (req, res) => {

  const { debut, fin, format } = req.body;

  try {
    const data = await natureoperationservice.exportNatures(debut, fin);

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
      <td>${d.codenature}</td>
      <td>${d.libelle}</td>
      <td>${d.typeoperation}</td>
      <td>${d.decajustifier}</td>
      <td>${d.imputationtiers}</td>
      <td>${d.demandedecaissement}</td>
      <td>${d.numcompte}</td>
      <td>${d.actif ? 'Actif' : 'Inactif'}</td>
    </tr>
  `).join('');

  const html = `
    <h3>Liste des natures d'opération</h3>
    <table border="1" cellspacing="0" cellpadding="5">
      <tr>
        <th>Code</th>
        <th>Libellé</th>
        <th>Type d'opération</th>
        <th>Déc. à justifier</th>
        <th>Imputation Tiers</th>
        <th>Dem. Décaissement</th>
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
  const sheet = workbook.addWorksheet('Natures opérations');

  sheet.columns = [
    { header: 'Code', key: 'codenature' },
    { header: 'Libellé', key: 'libelle' },
    { header: 'Type d\'opération', key: 'typeoperation' },
    { header: 'Déc. à justifier', key: 'decajustifier' },
    { header: 'Imputation Tiers', key: 'imputationtiers' },
    { header: 'Dem. Décaissement', key: 'demandedecaissement' },
    { header: 'Compte', key: 'numcompte' },
    // { header: 'Lib. Compte', key: 'compte_libelle' },
    { header: 'Statut', key: 'actif' }
  ];

  data.forEach(d => {
    sheet.addRow({
      codenature: d.codenature,
      libelle: d.libelle,
      typeoperation: d.typeoperation,
      decajustifier: d.decajustifier,
      imputationtiers: d.imputationtiers,
      demandedecaissement: d.demandedecaissement,
      numcompte: d.numcompte,
      // compte_libelle: d.compte_libelle,
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