const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function genererPdfRecu(data) {

    const templatePath = path.join(__dirname, '../../views/templates/recu-caisse.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Générer lignes HTML

    // lignes d'opérations
    const lignesHtml = data.lignes.map(l => `
        <tr>
            <td>${l.libelle || ''}</td>
            <td class="right">${l.montant.toLocaleString()}</td>
        </tr>
    `).join('');

    // caisses payeuses
    const caissesHtml = data.caisses.map(c => `
        <tr>
            <td>${c.libelle}</td>
            <td class="right">${c.montant.toLocaleString()} ${c.devise || ''}</td>
        </tr>
    `).join('');

    html = html
        .replace('{{societe}}', data.societe)
        .replace('{{site}}', data.site)
        .replace('{{date}}', data.date)
        .replace('{{numero}}', data.numero)
        .replace('{{type}}', data.type)
        .replace('{{devise}}', data.devise)
        .replace('{{description}}', data.description)
        .replace('{{total}}', data.total.toLocaleString())
        .replace('{{soldeouverture}}', data.soldeouverture.toLocaleString())
        .replace('{{soldefermeture}}', data.soldefermeture.toLocaleString())
        .replace('{{lignes}}', lignesHtml)
        .replace('{{caisses}}', caissesHtml);


    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const buffer = await page.pdf({
        width: '100mm',
        margin: { top: '5mm', bottom: '5mm' }
    });

    await browser.close();

    return buffer;
}

module.exports = { genererPdfRecu };
