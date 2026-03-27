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

async function genererPdfJournal(data, datedebut, datefin) {

    const donnees = data.data;
    const today = new Date();

    const templatePath = path.join(__dirname, '../../views/templates/journal-caisse.html');
    let html = fs.readFileSync(templatePath, 'utf8');

     // Soldes sécurisés
    const soldeOuverture = Number(donnees.soldeouverture || 0).toLocaleString('fr-FR');
    const soldeFermeture = Number(donnees.soldefermeture || 0).toLocaleString('fr-FR');

    // Remplacement entête
    html = html
        .replace('{{codesociete}}', donnees.codesociete || '')
        .replace('{{societe}}', donnees.raisonsociale || '')
        .replace('{{codesite}}', donnees.codesite || '')
        .replace('{{site}}', donnees.lib_site || '')
        .replace('{{codecaisse}}', donnees.codecaisse || '')
        .replace('{{caisse}}', donnees.lib_caisse || '')
        .replace(/{{devise}}/g, donnees.devise_caisse || '')
        .replace('{{datedebut}}', datedebut || '')
        .replace('{{datefin}}', datefin || '')
        .replace('{{dateimp}}', today.toLocaleDateString('fr-FR'))
        .replace('{{heureimp}}', today.toLocaleTimeString('fr-FR'))
        .replace('{{soldeouverture}}', soldeOuverture)
        .replace('{{soldefermeture}}', soldeFermeture);


    // Sécurité si aucune ligne
    const lignes = donnees.lignes || [];

    // Construction des lignes
    const lignesHtml = lignes.map(jour => {
        
        // Calcul des cumuls encaissement et décaissement par jour
         const totalEncaissement = jour.operations
        .filter(o => o.typeoperation?.toLowerCase() === 'encaissement')
        .reduce((sum, o) => sum + Number(o.montant || 0), 0);

        const totalDecaissement = jour.operations
        .filter(o => o.typeoperation?.toLowerCase() === 'decaissement')
        .reduce((sum, o) => sum + Number(o.montant || 0), 0);
        // 

    const operations = jour.operations.map(op => `
        <tr>
            <td>${op.codeoperation || ''}</td>
                <td>${op.nature || ''}</td>
                <td>${op.tiers || ''}</td>
            <td class="right">${Number(op.montant || 0).toLocaleString('fr-FR')} ${donnees.devise_caisse}</td>
        </tr>
    `).join('');

    const totaux = `
        <tr>
            <td colspan="3" class="left">
                <strong>Total encaissement : </strong>
                ${Number(totalEncaissement || 0).toLocaleString('fr-FR')} ${donnees.devise_caisse}
            </td>
            <td class="left"></td>
        </tr>
        <tr>
            <td colspan="3" class="left">
                <strong>Total encaissement : </strong>
                ${Number(totalDecaissement || 0).toLocaleString('fr-FR')} ${donnees.devise_caisse}
            </td>
            <td class="left"></td>
        </tr>
        `;

    return `
        <div class="jour">

            <div class="jour-header">
                <strong>Date :</strong> ${new Date(jour.date).toLocaleDateString('fr-FR')}
            </div>

            <div class="solde">
                Solde ouverture : 
                <strong>${Number(jour.solde_ouverture || 0).toLocaleString('fr-FR')} ${donnees.devise_caisse}</strong>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Pièce</th>
                        <th>Nature</th>
                        <th>Tiers</th>
                        <th class="right">Montant</th>
                    </tr>
                </thead>

                <tbody>
                    ${operations}
                    <div class="line"></div>
                    ${totaux}
                </tbody>
            </table>

            <div class="solde right">
                Solde fermeture :
                <strong>${Number(jour.solde_fermeture || 0).toLocaleString('fr-FR')} ${donnees.devise_caisse}</strong>
            </div>

            <div class="line"></div>

        </div>
    `;

    }).join('');

    html = html.replace('{{lignes}}', lignesHtml);

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const buffer = await page.pdf({
        margin: {
            top: '12mm',
            bottom: '12mm',
            left: '12mm',
            right: '12mm'
        },
        printBackground: true
    });

    console.log('PDF généré avec succès');

    await browser.close();

    return buffer;
}

module.exports = { genererPdfRecu , genererPdfJournal};
