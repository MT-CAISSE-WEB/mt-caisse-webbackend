const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');


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

    const donnees = data.data;

    // Sécurité si aucune ligne
    if (!donnees) {
        throw new Error('Aucune donnée disponible pour générer le PDF du journal de caisse.');
    }
    else {

        const caisses = donnees.caisses;

        const today = new Date();

        // Entête
        const templatePath = path.join(__dirname, '../../views/templates/journal-caisse.html');
        let html = fs.readFileSync(templatePath, 'utf8');

        html = html
            .replace('{{codesociete}}', donnees.codesociete || '')
            .replace('{{societe}}', donnees.raisonsociale || '')
            .replace('{{codesite}}', donnees.codesite || '')
            .replace('{{site}}', donnees.lib_site || '')
            .replace('{{datedebut}}', datedebut? new Date(datedebut).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '')
            .replace('{{datefin}}', datefin? new Date(datefin).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '')
            .replace('{{dateimp}}', today.toLocaleDateString('fr-FR'))
            .replace('{{heureimp}}', today.toLocaleTimeString('fr-FR'))
            .replace('{{utilisateur}}', utilisateur || '');



        // Construction des tableaux par caisse
        const tableauxCaisses = caisses.map(caisse => {

            // Récupere le solde de fermeture à chaque date
            const soldeFermeture = caisse.lignes.map(ligne => Number(ligne.solde_fermeture || 0.0).toLocaleString('fr-FR'));

            let soldeCourant = Number(caisse.solde_initial || 0.0);

            // Récupère les dates uniques des opérations du jour pour les afficher dans le solde final
            const datesUniques = [
                ...new Set(
                    caisse.lignes.flatMap(ligne => ligne.operations || [])
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
            ]
            const dates = datesUniques.join(', ');


            // Calcul des cumuls encaissement et décaissement par caisse
            const totalEncaissement = caisse.lignes.flatMap(ligne => ligne.operations || [])
                .filter(o => o.typeoperation?.toLowerCase().startsWith('encaissement'))
                .reduce((sum, o) => sum + Number(o.montant || 0), 0);

            const totalDecaissement = caisse.lignes.flatMap(ligne => ligne.operations || [])
                .filter(o => o.typeoperation?.toLowerCase().startsWith('decaissement'))
                .reduce((sum, o) => sum + Number(o.montant || 0), 0);


            // Les opérations sont regroupées par date pour afficher le solde de fermeture à chaque date
            const operations = caisse.lignes.flatMap(ligne => ligne.operations || []);

            const operationsParDate = {};

            caisse.lignes.forEach(ligne => {

                const date = ligne.date;           // la date de la journée

                if (!operationsParDate[date]) {
                    operationsParDate[date] = {
                        operations: [],
                        soldeFermeture: Number(ligne.solde_fermeture || 0)
                    };
                }

                operationsParDate[date].operations.push(...(ligne.operations || []));
            });

            // Construction des lignes d’opérations par date
            const lignes = Object.entries(operationsParDate).map(([date, groupe]) => {

                let totalEncaissementJour = 0;
                let totalDecaissementJour = 0;

                const operationsHtml = groupe.operations.map(operation => {

                    const montant = Number(operation.montant || 0);

                    const estDecaissement =
                        operation.typeoperation?.toLowerCase().startsWith('decaissement');

                    const estEncaissement =
                        operation.typeoperation?.toLowerCase().startsWith('encaissement');

                    if(estDecaissement)
                        totalDecaissementJour += montant;

                    if(estEncaissement)
                        totalEncaissementJour += montant;

                    // Calcul du solde courant au fil des opérations
                    if (estDecaissement) {
                        soldeCourant -= montant;
                    } else if (estEncaissement) {
                        soldeCourant += montant;
                    }

                    return `
                    <tr>
                        <td>${new Date(operation.dateoperation).toLocaleDateString('fr-FR')}</td>
                        <td>${operation.codeoperation}</td>
                        <td>${operation.libelle || ''}</td>
                        <td class="right">${estDecaissement ? montant.toLocaleString('fr-FR') : 0.0}</td>
                        <td class="right">${estEncaissement ? montant.toLocaleString('fr-FR') : 0.0}</td>
                        <td class="right">${Number(soldeCourant).toLocaleString('fr-FR') || 0}</td>
                    </tr>
                    `;
                }).join('');

                return `
                    ${operationsHtml}

                    <tr class="ligne-solde">
                        <td colspan="3" align="right">
                            <strong>
                                Solde au ${new Date(date).toLocaleDateString('fr-FR')}
                            </strong>
                        </td>

                        <td class="right">
                            <strong>${totalDecaissementJour.toLocaleString('fr-FR')}</strong>
                        </td>

                        <td class="right">
                            <strong>${totalEncaissementJour.toLocaleString('fr-FR')}</strong>
                        </td>

                        <td class="right">
                            <strong>${groupe.soldeFermeture.toLocaleString('fr-FR')}</strong>
                        </td>
                    </tr>
                `;
            }).join('');


            // Restitution HTML du tableau par caisse
            return `
                <table class="mouvements">
    
                    <tr class="titre-caisse">
                        <td colspan="6">
                            <div class="entete-caisse">
                                <div class="caisse">
                                    <strong>Caisse :</strong>
                                    ${caisse.codecaisse} - ${caisse.lib_caisse}
                                </div>

                                <div class="solde">
                                    Solde initial au ${
                                        caisse.lignes[0].date
                                            ? new Date(caisse.lignes[0].date).toLocaleDateString('fr-FR')
                                            : ''
                                    } : 
                                    <strong class="solde-initial">
                                        ${Number(caisse.solde_initial).toLocaleString('fr-FR')} ${caisse.devise}
                                    </strong>
                                </div>
                            </div>
                        </td>
                    </tr>

                    <tr class="entete">
                        <th width="8%">Date</th>
                        <th width="21%">N° Pièce</th>
                        <th width="41%">Libellé</th>
                        <th width="10%">Dépenses</th>
                        <th width="10%">Recettes</th>
                        <th width="10%">Solde</th>
                    </tr>

                    ${lignes}

                </table>

                <br/>
            `;

        }).join('');

        html = html.replace('{{lignes}}', tableauxCaisses);

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

        await browser.close();

        return buffer;
    }
}

async function genererXlsxJournal(data, datedebut, datefin, utilisateur) {

    const donnees = data.data;

    if (!donnees) {
        throw new Error("Aucune donnée disponible.");
    }

    const workbook = new ExcelJS.Workbook();

    workbook.creator = utilisateur;
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Journal de caisse");

    sheet.addRow(["Société", donnees.codesociete + " - " + donnees.raisonsociale]);
    sheet.addRow(["Site", donnees.codesite + " - " + donnees.lib_site]);
    sheet.addRow(["Date début", datedebut]);
    sheet.addRow(["Date fin", datefin]);
    sheet.addRow(["Imprimé par", utilisateur]);

    sheet.addRow([]);

    donnees.caisses.forEach(caisse => {

        sheet.addRow([`CAISSE : ${caisse.codecaisse} - ${caisse.lib_caisse}`]);

        sheet.lastRow.font = {bold: true, size: 12};

        sheet.addRow(["Solde initial", (caisse.solde_initial)]);

        sheet.addRow([]);

        sheet.addRow([
            "Date",
            "N° Pièce",
            "Libellé",
            "Dépenses",
            "Recettes",
            "Solde"
        ]);

        sheet.lastRow.font = { bold: true };

        let soldeCourant = Number(caisse.solde_initial);

        const operationsParDate = {};

        caisse.lignes.forEach(ligne => {

            if (!operationsParDate[ligne.date]) {

                operationsParDate[ligne.date] = {
                    operations: [],
                    soldeFermeture: Number(ligne.solde_fermeture)
                };

            }

            operationsParDate[ligne.date].operations.push(...ligne.operations);

        });

        Object.entries(operationsParDate).forEach(([date, groupe]) => {

            let totalDepenses = 0;
            let totalRecettes = 0;

            groupe.operations.forEach(op => {

                const montant = Number(op.montant);

                const depense = op.typeoperation
                    ?.toLowerCase()
                    .startsWith("decaissement");

                const recette = op.typeoperation
                    ?.toLowerCase()
                    .startsWith("encaissement");

                if (depense) {
                    totalDepenses += montant;
                    soldeCourant -= montant;
                }

                if (recette) {
                    totalRecettes += montant;
                    soldeCourant += montant;
                }

                sheet.addRow([
                    new Date(op.dateoperation),
                    op.codeoperation,
                    op.libelle,
                    depense ? montant : "",
                    recette ? montant : "",
                    soldeCourant
                ]);

            });

            const row = sheet.addRow([
                "",
                "",
                "SOLDE AU " + new Date(date).toLocaleDateString("fr-FR"),
                totalDepenses,
                totalRecettes,
                groupe.soldeFermeture
            ]);

            row.font = {
                bold: true
            };

        });

        sheet.addRow([]);
        sheet.addRow([]);

    });

    sheet.columns = [
        { width: 15 },
        { width: 25 },
        { width: 50 },
        { width: 18 },
        { width: 18 },
        { width: 18 }
    ];

    sheet.eachRow(row => {

        row.eachCell(cell => {

            if (typeof cell.value === "number") {

                cell.numFmt = '#,##0';

            }

        });

    });

    sheet.views = [
        {
            state: 'frozen',
            ySplit: 7
        }
    ];

    const buffer = await workbook.xlsx.writeBuffer();

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


module.exports = { genererPdfRecu , genererPdfJournal, genererXlsxJournal};
