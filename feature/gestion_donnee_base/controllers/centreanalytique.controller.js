const centreanalytiqueservice = require("../services/centreanalytique.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

const ExcelJS = require('exceljs');
const puppeteer = require('puppeteer');

/**
 * Liste tous les centres analytiques
 */
// OK
module.exports.get_allcentres = asyncHandler(async(req, res, next) => {
  try {
    const centres = await centreanalytiqueservice.get_allcentres();
    res.json({ success: true, data: centres });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});


/**
 * Un centre existant par son id
 */ 
// OK
module.exports.get_onecentre = asyncHandler(async(req, res, next) => {
  try {
    const idcentre  = req.params.idcentre;
    const centre_ = await centreanalytiqueservice.get_by_idcentre(idcentre);
    res.json({ success: true, data: centre_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


/**
 * Crée un nouveau centre
 */
module.exports.create_centre = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_centre = await centreanalytiqueservice.create_centre(data);
    res.status(201).json({ success: true, data: new_centre });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


/**
 * Met à jour un centre existant
 */
module.exports.update_centre = asyncHandler(async(req, res, next) => {
  try {
    const idcentre  = req.params.idcentre;
    const centre_ = await centreanalytiqueservice.update_centre(idcentre, req.body);
    res.json({ success: true, data: centre_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});



/**
 * Supprime un centre
 */
module.exports.delete_centre = asyncHandler(async(req, res, next) => {
  try {
    const idcentre = req.params.idcentre;
    const centre_ = await centreanalytiqueservice.delete_centre(idcentre);
    res.json({ success: true, message: "Centre analytique supprimé avec succès." });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


/**
 * Importer un plan comptable à partir d'un fichier CSV
 */
module.exports.import_centre_analytique = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({success: false, message: 'Aucun fichier reçu'});
  }
  const info = req.body;
  const result = await centreanalytiqueservice.import_centre_analytique(req.file.path, info);
  res.status(201).json({success: true, data: result});
});


module.exports.exportCentres = asyncHandler(async (req, res) => {

  const { debut, fin, format } = req.body;

  try {
    const data = await centreanalytiqueservice.exportCentres(debut, fin);

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
      <td>${d.codecentreanalytique}</td>
      <td>${d.libelle}</td>
      <td>${d.actif ? 'Actif' : 'Inactif'}</td>
    </tr>
  `).join('');

  const html = `
    <h3>Liste des centres analytiques</h3>
    <table border="1" cellspacing="0" cellpadding="5">
      <tr>
        <th>Code</th>
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
  const sheet = workbook.addWorksheet('Centres analytiques');

  sheet.columns = [
    { header: 'Code', key: 'codecentreanalytique' },
    { header: 'Libellé', key: 'libelle' },
    { header: 'Statut', key: 'actif' }
  ];

  data.forEach(d => {
    sheet.addRow({
      codecentreanalytique: d.codecentreanalytique,
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
