const affectationdepartementnature = require("../services/affectationdeptnature.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

const ExcelJS = require('exceljs');
const puppeteer = require('puppeteer');


// Récupère les natures non affectées à une nature
module.exports.getAllNatures = asyncHandler(async(req, res, next) => {
  try {
    const iddepartement  = req.params.iddepartement;
    const natures = await affectationdepartementnature.getAllNatures(iddepartement);
    res.json({ success: true, data: natures });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


// Sauvegarde les affectations des natures à une nature
module.exports.saveAffectations = asyncHandler(async(req, res, next) => {
  try {
    const iddepartement  = req.params.iddepartement;
    const data  = req.body;
    const affectation_ = await affectationdepartementnature.saveAffectations(iddepartement, data);
    res.json({ success: true, data: affectation_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});


module.exports.exportAffDepartements = asyncHandler(async (req, res) => {

  const { debut, fin, format } = req.body;

  console.log(debut, fin, format);

  try {
    const data = await affectationdepartementnature.exportAffDepartements(debut, fin);

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
      <td>${d.codedept}</td>
      <td>${d.libelle}</td>
      <td>${d.codenature}</td>
      <td>${d.libellenature}</td>
    </tr>
  `).join('');

  const html = `
    <h3>Liste des affectations</h3>
    <table border="1" cellspacing="0" cellpadding="5">
      <tr>
        <th>Code Département</th>
        <th>Libellé Département</th>
        <th>Code Nature</th>
        <th>Libellé Nature</th>
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
    { header: 'Code Département', key: 'codedept' },
    { header: 'Libellé Département', key: 'libelle' },
    { header: 'Code Nature', key: 'codenature' },
    { header: 'Libellé Nature', key: 'libellenature' }
  ];

  data.forEach(d => {
    sheet.addRow({
      codedept: d.codedept,
      libelle: d.libelle,
      codenature: d.codenature,
      libellenature: d.libellenature
    });
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  await workbook.xlsx.write(res);
  res.end();
}