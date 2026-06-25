const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');


async function genererPdfRecu(data, copies = 2) {

    const templatePath = path.join(__dirname, '../../views/templates/recu-caisse.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // =========================
    // TABLES HTML
    // =========================

    const lignesHtml = data.lignes.map(l => `
        <tr>
            <td>${l.libelle || ''}</td>
            <td class="right">${(l.montant || 0).toLocaleString()}</td>
        </tr>
    `).join('');

    const caissesHtml = data.caisses.map(c => `
        <tr>
            <td>${c.libelle || ''}</td>
            <td class="right">${(c.montant || 0).toLocaleString()} ${c.devise || ''}</td>
        </tr>
    `).join('');

    // =========================
    // TEMPLATE D’UN TICKET
    // =========================

    const ticketTemplate = `
        <div class="ticket">

            <div class="center bold">REÇU DE CAISSE</div>
            <div class="center">${data.societe}</div>
            <div class="center small">${data.site}</div>

            <div class="line"></div>

            <div>Date : ${data.date}</div>
            <div>N° opération : ${data.numero}</div>
            <div>Type : ${data.type}</div>

            <div class="line"></div>

            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${data.description || ''}</td>
                    </tr>
                </tbody>
            </table>

            <div class="line"></div>

            <div class="bold right">
                Total : ${(data.total || 0).toLocaleString()} ${data.devise}
            </div>

            <div class="line"></div>

            <br><br>

            <div class="bold center">PAIEMENT</div>

            <br>

            <table>
                <thead>
                    <tr>
                        <th>Caisse</th>
                        <th class="right">Montant</th>
                    </tr>
                </thead>
                <tbody>
                    ${caissesHtml}
                </tbody>
            </table>

            <div class="line"></div>

            <br><br><br>

            <table>
                <tr>
                    <td>
                        <div class="bold">Le caissier</div>
                        <br><br><br>
                        <div class="small">Signature</div>
                    </td>
                    <td class="right">
                        <div class="bold">Le bénéficiaire</div>
                        <br><br><br>
                        <div class="small">Signature</div>
                    </td>
                </tr>
            </table>

        </div>
    `;

    // =========================
    // DUPLICATION
    // =========================

    const ticketsHtml = Array.from({ length: copies }, (_, i) => `
        ${ticketTemplate}
        ${i < copies - 1 ? '<div class="separator"></div>' : ''}
    `).join('');

    // =========================
    // INJECTION
    // =========================

    html = html.replace('{{tickets}}', ticketsHtml);

    // =========================
    // PDF
    // =========================

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

async function genererPdfJournal(data, datedebut, datefin, utilisateur){

    console.log(data);

    const donnees = data.data;
    const today = new Date();

    // Récupere la première date d’opération pour l’afficher dans le solde initial
    const premiereDate = donnees.lignes && donnees.lignes.length > 0 && donnees.lignes[0].operations && donnees.lignes[0].operations.length > 0
        ? new Date(donnees.lignes[0].operations[0].dateoperation).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '';

    const templatePath = path.join(__dirname, '../../views/templates/journal-caisse.html');
    let html = fs.readFileSync(templatePath, 'utf8');

     // Soldes sécurisés
    const soldeOuverture = Number(donnees.soldeouverture || 0).toLocaleString('fr-FR');
    const soldeFermeture = Number(donnees.soldefermeture || 0).toLocaleString('fr-FR');

    // Récupére la premiere valeur du champ soldeouverture pour l’afficher dans le solde initial
    const soldeInitial = donnees.lignes && donnees.lignes.length > 0
        ? Number(donnees.lignes[0].solde_ouverture || 0).toLocaleString('fr-FR')
        : 'Aucun solde';


    // Remplacement entête
    html = html
        .replace('{{codesociete}}', donnees.codesociete || '')
        .replace('{{societe}}', donnees.raisonsociale || '')
        .replace('{{codesite}}', donnees.codesite || '')
        .replace('{{site}}', donnees.lib_site || '')
        .replace('{{codejournal}}', donnees.codejournal || '')
        .replace('{{journal}}', donnees.lib_journal || '')
        .replace('{{codecaisse}}', donnees.codecaisse || '')
        .replace('{{caisse}}', donnees.lib_caisse || '')
        .replace(/{{devise}}/g, donnees.devise_caisse || '')
        .replace('{{datedebut}}', datedebut? new Date(datedebut).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '')
        .replace('{{datefin}}', datefin? new Date(datefin).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '')
        .replace('{{dateimp}}', today.toLocaleDateString('fr-FR'))
        .replace('{{heureimp}}', today.toLocaleTimeString('fr-FR'))
        .replace('{{soldeouverture}}', soldeOuverture)
        .replace('{{soldefermeture}}', soldeFermeture)
        .replace('{{utilisateur}}', utilisateur || '')
        .replace('{{date_solde}}', premiereDate)
        .replace('{{solde_initial}}', soldeInitial);


    // Sécurité si aucune ligne
    const lignes = donnees.lignes || [];

    // Construction des lignes
    const lignesHtml = lignes.map(jour => {
        
        // Calcul des cumuls encaissement et décaissement par jour
         const totalEncaissement = jour.operations
        .filter(o => o.typeoperation?.toLowerCase() === 'encaissement')
        .reduce((sum, o) => sum + Number(o.montant || 0), 0);

        const totalDecaissement = jour.operations
        .filter(o => o.typeoperation?.substring(0, 12).toLowerCase() === 'decaissement')
        .reduce((sum, o) => sum + Number(o.montant || 0), 0);

        // const soldeFinal = (Number(jour.solde_ouverture || 0) + totalEncaissement - totalDecaissement).toLocaleString('fr-FR');

        const soldeFinal = (Number(jour.solde_fermeture || 0)).toLocaleString('fr-FR');

        // Calcul du solde courant au fil des opérations
        let soldeCourant = Number(jour.solde_ouverture || 0);

        // Construction des lignes d’opérations
        const operations = jour.operations.map(op => {

            const montant = Number(op.montant || 0);

            if (op.typeoperation?.substring(0, 12).toLowerCase() === 'decaissement') {
                soldeCourant -= montant;
            } else if (op.typeoperation?.toLowerCase() === 'encaissement') {
                soldeCourant += montant;
            }

            return `
                <tr>
                    <td>
                        ${op.dateoperation
                            ? new Date(op.dateoperation).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            })
                            : ''}
                    </td>
                    <td>${op.codeoperation || ''}</td>
                    <td>${op.libelle || ''}</td>

                    <td class="right">
                        ${op.typeoperation?.substring(0, 12).toLowerCase() === 'decaissement'
                            ? montant.toLocaleString('fr-FR')
                            : 0.0}
                    </td>

                    <td class="right">
                        ${op.typeoperation?.toLowerCase() === 'encaissement'
                            ? montant.toLocaleString('fr-FR')
                            : 0.0}
                    </td>

                    <td class="right">
                        ${soldeCourant.toLocaleString('fr-FR')}
                    </td>

                </tr>
            `;
        }).join('');

        // Récupère les dates uniques des opérations du jour pour les afficher dans le solde final
        const datesUniques = [
            ...new Set(
                jour.operations
                    .map(o => {
                        if (!o.dateoperation) return null;

                        return new Date(o.dateoperation).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        });
                    })
                    .filter(Boolean)
            )
        ];

        const dates = datesUniques.join(', ');

        // Affiche les totaux du jour et le solde final
        const totaux = `
            <tr class="total-row">
                <td colspan="3" class="right">
                    Solde au ${jour.dateoperation || ''} ${dates}
                </td>
                <td class="num">
                    ${Number(totalDecaissement || 0.0).toLocaleString('fr-FR')}
                </td>
                <td class="num">
                    ${Number(totalEncaissement || 0.0).toLocaleString('fr-FR')}
                </td>
                <td class="num">${soldeFinal}</td>
            </tr>
            `;

        return `
            ${operations}
            ${totaux}
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

async function genererPdfCloture(data, datedebut, datefin,){
    const donnees = data.data;
    const today = new Date();

    const templatePath = path.join(__dirname, '../../views/templates/etat-cloture.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Remplacement entête
    html = html
        .replace('{{codesociete}}', donnees.codesociete || '')
        .replace('{{societe}}', donnees.raisonsociale || '')
        .replace('{{codesite}}', donnees.codesite || '')
        .replace('{{site}}', donnees.site || '')
        .replace('{{codecaisse}}', donnees.codecaisse || '')
        .replace('{{caisse}}', donnees.caisse.libelle || '')
        .replace(/{{devise}}/g, donnees.devise || '')
        .replace('{{datedebut}}', datedebut || '')
        .replace('{{datefin}}', datefin || '');

    // Sécurité si aucune ligne
    const lignes = donnees || [];

    const operations = donnees.map(op => `
        <tr>
            <td>${op.date || ''}</td>
            <td>${op.caisse.libelle || ''}</td>
            <td>${op.devise || ''}</td>
            <td class="right">${Number(op.soldes.ouverture || 0).toLocaleString('fr-FR')}</td>
            <td class="right">${Number(soldes.fermeture || 0).toLocaleString('fr-FR')}</td>
            <td class="right">${Number(op.soldes.physique || 0).toLocaleString('fr-FR')}</td>
            <td class="right">${Number(op.soldes.ecart || 0).toLocaleString('fr-FR')}</td>
            <td>${op.statut || ''}</td>
        </tr>
    `).join('');

}

module.exports = { genererPdfRecu , genererPdfJournal};
