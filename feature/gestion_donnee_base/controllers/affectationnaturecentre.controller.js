const affectationnaturecentre = require("../services/affectationnaturecentre.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

const ExcelJS = require('exceljs');
const puppeteer = require('puppeteer');


// Récupère les centres non affectés à une nature
module.exports.getallCentres = asyncHandler(async(req, res, next) => {
  try {
    const idnature  = req.params.idnature;
    const centres = await affectationnaturecentre.getAllCentres(idnature);
    res.json({ success: true, data: centres });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


// Sauvegarde les affectations des centres à une nature
module.exports.saveAffectations = asyncHandler(async(req, res, next) => {
  try {
    const idnature  = req.params.idnature;
    const { idsCentres, info } = req.body;
    const affectation_ = await affectationnaturecentre.saveAffectations(idnature, idsCentres, info);
    res.json({ success: true, data: affectation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


module.exports.exportAffCentres = asyncHandler(async (req, res) => {

  const { debut, fin, format } = req.body;

  try {
    const data = await affectationnaturecentre.exportAffCentres(debut, fin);

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
      <td>${d.libellenature}</td>
      <td>${d.codecentreanalytique}</td>
      <td>${d.libellecentre}</td>
    </tr>
  `).join('');

  const html = `
    <h3>Liste des affectations</h3>
    <table border="1" cellspacing="0" cellpadding="5">
      <tr>
        <th>Code Nature</th>
        <th>Libellé Nature</th>
        <th>Code Centre</th>
        <th>Libellé Centre</th>
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
  const sheet = workbook.addWorksheet('Affectations');

  sheet.columns = [
    { header: 'Code Nature', key: 'codenature' },
    { header: 'Libellé Nature', key: 'libellenature' },
    { header: 'Code Centre', key: 'codecentreanalytique' },
    { header: 'Libellé Centre', key: 'libellecentre' }
  ];

  data.forEach(d => {
    sheet.addRow({
      codenature: d.codenature,
      libellenature: d.libellenature,
      codecentreanalytique: d.codecentreanalytique,
      libellecentre: d.libellecentre
    });
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  await workbook.xlsx.write(res);
  res.end();
}


module.exports.import_affectations = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({success: false, message: 'Aucun fichier reçu'});
  }
  try {
    const info = req.body;
    const result = await affectationnaturecentre.import_affectations(req.file.path, info);
    res.status(201).json({success: true, data: result});
  } catch (err) {
    console.log(err.message);
    res.status(500).json({success: false, message: err.message});
  }
});
