const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const QRCode = require('qrcode');



// ============================================
// UTILITAIRES POUR LE REÇU DE CAISSE PROFESSIONNEL
// ============================================

/**
 * Convertit un montant numérique en lettres (français)
 * @param {number} montant - Le montant à convertir
 * @param {string} devise - La devise (ex: 'XAF', 'FCFA', 'EUR')
 * @returns {string} Le montant en toutes lettres
 */
function montantEnLettres(montant, devise = 'XAF') {
    const units = ['', 'UN', 'DEUX', 'TROIS', 'QUATRE', 'CINQ', 'SIX', 'SEPT', 'HUIT', 'NEUF'];
    const teens = ['DIX', 'ONZE', 'DOUZE', 'TREIZE', 'QUATORZE', 'QUINZE', 'SEIZE', 'DIX-SEPT', 'DIX-HUIT', 'DIX-NEUF'];
    const tens = ['', 'DIX', 'VINGT', 'TRENTE', 'QUARANTE', 'CINQUANTE', 'SOIXANTE', 'SOIXANTE-DIX', 'QUATRE-VINGT', 'QUATRE-VINGT-DIX'];

    function convertLessThanOneThousand(n) {
        let result = '';
        const hundred = Math.floor(n / 100);
        const remainder = n % 100;

        if (hundred > 0) {
            result += units[hundred] + ' CENT';
            if (hundred > 1) result += 'S';
            if (remainder > 0) result += ' ';
        }

        if (remainder > 0) {
            if (remainder < 10) {
                result += units[remainder];
            } else if (remainder < 20) {
                result += teens[remainder - 10];
            } else {
                const ten = Math.floor(remainder / 10);
                const unit = remainder % 10;
                result += tens[ten];
                if (unit > 0) {
                    if (ten === 7 || ten === 9) {
                        result += '-' + units[unit + 1];
                    } else {
                        result += '-' + units[unit];
                    }
                }
            }
        }

        return result;
    }

    if (montant === 0) {
        return `ZÉRO ${devise === 'EUR' ? 'EURO' : devise === 'USD' ? 'DOLLAR' : devise === 'CDF' ? 'FRANCS CONGOLAIS' : 'FRANCS CFA'}`;
    }

    const isNegative = montant < 0;
    montant = Math.abs(Math.round(montant));

    const scales = [
        { value: 1000000000, name: 'MILLIARD' },
        { value: 1000000, name: 'MILLION' },
        { value: 1000, name: 'MILLE' }
    ];

    let result = '';
    let remaining = montant;

    for (const scale of scales) {
        const count = Math.floor(remaining / scale.value);
        if (count > 0) {
            const part = convertLessThanOneThousand(count);
            result += (result ? ' ' : '') + part + ' ' + scale.name;
            if (count > 1 && scale.name !== 'MILLE') {
                result += 'S';
            }
            remaining %= scale.value;
        }
    }

    if (remaining > 0) {
        const part = convertLessThanOneThousand(remaining);
        result += (result ? ' ' : '') + part;
    }

    const currencyName = devise === 'EUR' ? 'EURO' :
        devise === 'USD' ? 'DOLLAR' :
            devise === 'XAF' || devise === 'FCFA' ? 'FRANCS CFA' : devise === 'CDF' ? 'FRANCS CONGOLAIS' :
                'UNITÉ';

    result += ' ' + (montant === 1 ? currencyName : currencyName + (currencyName === 'FRANCS CFA' ? '' : 'S'));

    if (isNegative) {
        result = 'MOINS ' + result;
    }

    return result;
}

/**
 * Formate une date au format français
 * @param {Date|string} date - La date à formater
 * @returns {string} La date formatée
 */
function formaterDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Formate un montant avec séparateurs de milliers
 * @param {number} montant - Le montant à formater
 * @param {string} devise - La devise
 * @returns {string} Le montant formaté
 */
function formaterMontant(montant, devise = '') {
    if (montant === null || montant === undefined) return '0' + (devise ? ' ' + devise : '');
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(montant) + (devise ? ' ' + devise : '');
}


/**
 * Génère un reçu de caisse professionnel en PDF
 * @param {Object} data - Les données du reçu
 * @param {number} copies - Nombre de copies à générer
 * @returns {Promise<Buffer>} Le buffer PDF
 */
async function genererPdfRecu(data, copies = 2) {
    const templatePath = path.join(__dirname, '../../views/templates/recu-caisse.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // =========================
    // GÉNÉRATION DU QR CODE
    // =========================
    let qrCodeBase64 = '';


    try {
        const qrData = `http://192.168.1.116:4200/app/verification?op=${data.numero}`;
        qrCodeBase64 = await QRCode.toDataURL(qrData);
    } catch (e) {
        console.error('Erreur QR Code:', e);
    }

    // =========================
    // TEMPLATE D'UN TICKET
    // =========================
    const ticketTemplate = `
<div class="page">
  <div class="content">
    <!-- ========== EN-TÊTE ========== -->
  <div class="header">
    <div class="header-left">
      <div class="logo-container">
        <div class="logo-placeholder">${(data.societe || 'E').charAt(0).toUpperCase()}</div>
      </div>
      <div class="company-info">
        <div class="company-name">${data.societe || 'Entreprise'}</div>
        ${data.site ? `<div class="company-site">${data.site}</div>` : ''}
        ${data.adresse ? `<div class="company-details">${data.adresse}</div>` : ''}
        ${data.contact ? `<div class="company-details">${data.contact}</div>` : ''}
      </div>
    </div>
    <div class="header-right">
      <div class="receipt-title">${data.typeOperation === 'encaissement' ? 'REÇU D\'ENCAISSEMENT' : 'REÇU DE DÉCAISSEMENT'}</div>
      <div class="receipt-subtitle">N° <strong>${data.numero || ''}</strong></div>
      ${data.date ? `<div class="receipt-date">Date: ${formaterDate(data.date)}</div>` : ''}
    </div>
  </div>

  <!-- ========== INFOS PRINCIPALES ========== -->
  <div class="main-info">
    <!-- Section 1: Informations de la demande (si demande existe) -->
    ${data.numeroDemande ? `
    <div class="info-section">
      <div class="info-section-title">Informations de la demande</div>
      <div class="info-grid">
      ${data.numeroDemande ? `<div class="info-item">
            <span class="info-label">N° Demande:</span>
          <span class="info-value"><strong>${data.numeroDemande}</strong></span>
        </div>` : ''}
        <div class="info-item">
          <span class="info-label">Département:</span>
          <span class="info-value">${data.libelleDep || ''}</span>
        </div>
        ${data.tiers ? `
        <div class="info-item">
          <span class="info-label">Tiers:</span>
          <span class="info-value">${data.tiers}</span>
        </div>` : ''}
      </div>
    </div>` : ''}

    <!-- Section 2: Montant et devise -->
    <div class="info-section">
      <div class="info-section-title">Montant</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Type:</span>
          <span class="info-value">${data.type || '-'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Devise:</span>
          <span class="info-value">${data.devise || 'XAF'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Total:</span>
          <span class="info-value info-value-highlight">${formaterMontant(data.total || 0, data.devise)}</span>
        </div>
      </div>
      <div class="amount-in-words">
        ${montantEnLettres(data.total || 0, data.devise || 'XAF')}
      </div>
    </div>
  </div>

  <!-- ========== DÉTAILS OPÉRATION ========== -->
  <div class="operation-section">
    <div class="operation-header">
      <span class="operation-icon">📋</span>
      <span class="operation-title">Détails de l'opération</span>
    </div>
    <div class="operation-details">
      <div class="operation-item">
        <span class="operation-item-label">Libellé:</span>
        <span class="operation-item-value">${data.libelleOperation || data.description || ''}</span>
      </div>
      <div class="operation-item">
        <span class="operation-item-label">Bénéficiaire:</span>
        <span class="operation-item-value">${data.beneficiaire || ''}</span>
      </div>
      <div class="operation-item">
        <span class="operation-item-label">Caissier:</span>
        <span class="operation-item-value">${data.caissier || ''}</span>
      </div>
    </div>
  </div>

  <!-- ========== TABLEAUX ========== -->
  ${data.lignes && data.lignes.length > 0 ? `
  <div class="table-container">
    <table class="operation-table">
      <thead>
        <tr>
          <th class="center">N°</th>
          <th>Désignation</th>
          <th>Centre analytique</th>
          <th class="right">Montant</th>
        </tr>
      </thead>
      <tbody>
        ${data.lignes.map((l, index) => `
          <tr>
            <td class="center">${index + 1}</td>
            <td>${l.libelle || l.nature || l.designation || ''}</td>
            <td>${l.libelleCentre || '-'}</td>
            <td class="right bold">${formaterMontant(l.montant || 0, data.devise)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>` : ''}

  ${data.caisses && data.caisses.length > 0 ? `
  <div class="table-container">
    <table class="caisse-table">
      <thead>
        <tr>
          <th>Caisse</th>
          <th class="center">Code</th>
          <th class="right">Montant</th>
        </tr>
      </thead>
      <tbody>
        ${data.caisses.map(c => `
          <tr>
            <td>${c.libelle || c.caisse || ''}</td>
            <td class="center">${c.code || c.codecaisse || 'N/A'}</td>
            <td class="right bold">${formaterMontant(c.montant || 0, c.devise || data.devise)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>` : ''}

  <!-- ========== APPROBATIONS (Validateurs) ========== -->
  ${data.validateurs && data.validateurs.length > 0 ? `
  <div class="approval-section">
    <div class="approval-title">✅ Approbations</div>
    <div class="approval-grid">
      ${data.validateurs.map(v => `
        <div class="approval-item">
          <div class="approval-name">${v.nom}</div>
          <div class="approval-status">${v.statut === 'approuve' ? '✔️' : '❌'} ${v.statut.toUpperCase()}</div>
          ${v.dateValidation ? `<div class="approval-date">Le ${v.dateValidation}</div>` : ''}
        </div>
      `).join('')}
    </div>
  </div>` : ''}

  <!-- ========== RÉCAPITULATIF + QR CODE ========== -->
        <div class="total-section">
          <div class="total-section-title">Récapitulatif</div>

          <!-- Infos opération -->
          <div class="total-line">
            <span class="total-label">Type:</span>
            <span class="total-amount">${data.type === 'encaissement' ? 'ENCAISSEMENT' : 'DÉCAISSEMENT'}</span>
          </div>
          <div class="total-line">
            <span class="total-label">Date:</span>
            <span class="total-amount">${data.date}</span>
          </div>
          ${data.numeroDemande ? `
          <div class="total-line">
            <span class="total-label">N° Demande:</span>
            <span class="total-amount">${data.numeroDemande}</span>
          </div>` : ''}
          ${data.libelleDep ? `
          <div class="total-line">
            <span class="total-label">Département:</span>
            <span class="total-amount">${data.libelleDep} ${data.codeDep ? `(${data.codeDep})` : ''}</span>
          </div>` : ''}

          <!-- Soldes -->
          ${data.soldeouverture !== undefined ? `
          <div class="total-line">
            <span class="total-label">Solde avant:</span>
            <span class="total-amount">${formaterMontant(data.soldeouverture, data.devise)}</span>
          </div>` : ''}
          ${data.soldefermeture !== undefined ? `
          <div class="total-line">
            <span class="total-label">Solde après:</span>
            <span class="total-amount">${formaterMontant(data.soldefermeture, data.devise)}</span>
          </div>` : ''}

          <!-- Total principal -->
          <div class="total-line total-line-main">
            <span class="total-label">TOTAL:</span>
            <span class="total-amount">${formaterMontant(data.total || 0, data.devise)}</span>
          </div>

          <!-- Acteurs -->
          <div class="total-line">
            <span class="total-label">Caissier:</span>
            <span class="total-amount">${data.caissier || '-'}</span>
          </div>
          <div class="total-line">
            <span class="total-label">Bénéficiaire:</span>
            <span class="total-amount">${data.beneficiaire || '-'}</span>
          </div>
        </div>

        <!-- ========== QR CODE ========== -->
        ${qrCodeBase64 ? `
        <div class="qrcode-section">
          <div class="qrcode-title">🔍 Vérification</div>
          <img src="${qrCodeBase64}" class="qrcode-image" alt="QR Code">
          <div class="qrcode-text">${data.numero || 'N/A'}</div>
        </div>` : ''}

  <!-- ========== SIGNATURES ========== -->
  <div class="signature-section">
    <div class="signature-title">Signatures</div>
    <div class="signature-grid">
      <div class="signature-block">
        <div class="signature-block-title">Caissier</div>
        <div class="signature-block-name">${data.emetteur || data.caissier || 'N/A'}</div>
        <div class="signature-line"></div>
        ${data.dateEmetteur ? `<div class="signature-date">Le ${formaterDate(data.dateEmetteur)}</div>` : ''}
      </div>
      <div class="signature-block">
        <div class="signature-block-title">Bénéficiaire</div>
        <div class="signature-block-name">${data.beneficiaire || 'N/A'}</div>
        <div class="signature-line"></div>
        ${data.dateBeneficiaire ? `<div class="signature-date">Le ${formaterDate(data.dateBeneficiaire)}</div>` : ''}
      </div>
    </div>
  </div>

  <!-- ========== PIED DE PAGE ========== -->
  <div class="footer">
    <div class="footer-text">
      Document généré le ${formaterDate(new Date())} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
    </div>
    ${data.mention ? `<div class="footer-mention">${data.mention}</div>` : ''}
    <div class="footer-warning">
      REÇU LA SOMME DE (EN LETTRES): <strong>${montantEnLettres(data.total || 0, data.devise || 'XAF')}</strong>
    </div>
    <div class="footer-note" style="margin-top: 8px; font-size: 10px;">
      A REMPLIR À LA CAISSE PAR LE BÉNÉFICIAIRE
    </div>
  </div>
  </div>
</div>
`;

    // =========================
    // DUPLICATION POUR COPIES
    // =========================
    const ticketsHtml = Array.from({ length: copies }, (_, i) => {
        const isCopy = i > 0;
        const copyTemplate = ticketTemplate
            .replace('Original', isCopy ? `Copie ${i + 1}` : 'Original')
            .replace('background: linear-gradient(135deg, rgba(30, 64, 175, 0.1), rgba(59, 130, 246, 0.1))',
                isCopy ? 'background: rgba(239, 68, 68, 0.05)' : 'background: linear-gradient(135deg, rgba(30, 64, 175, 0.1), rgba(59, 130, 246, 0.1))')
            .replace('border: 2px solid var(--primary-light)',
                isCopy ? 'border: 2px solid rgba(239, 68, 68, 0.2)' : 'border: 2px solid var(--primary-light)');

        return (i > 0 ? '<div class="copy-separator"><span>COPIE ' + (i + 1) + '</span></div>' : '') + copyTemplate;
    }).join('');


    // =========================
    // INJECTION DANS TEMPLATE
    // =========================
    html = html.replace(/{{societe}}/g, data.societe || 'Entreprise');
    html = html.replace('{{tickets}}', ticketsHtml);

    // =========================
    // GÉNÉRATION PDF
    // =========================
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    });

    const page = await browser.newPage();

    // Configuration pour un rendu optimal
    await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000
    });

    // Appliquer des styles supplémentaires pour le PDF
    await page.addStyleTag({
        content: `
      @page {
        size: A4;
        margin: 10mm;
      }
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    `
    });

    const buffer = await page.pdf({
        format: 'A4',
        margin: {
            top: '3mm',
            bottom: '3mm',
            left: '4mm',
            right: '4mm'
        },
        printBackground: true,
        preferCSSPageSize: true
    });

    await browser.close();
    return buffer;
}


async function genererPdfJournal(data, datedebut, datefin, utilisateur) {

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
            .replace('{{datedebut}}', datedebut ? new Date(datedebut).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '')
            .replace('{{datefin}}', datefin ? new Date(datefin).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '')
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

                    if (estDecaissement)
                        totalDecaissementJour += montant;

                    if (estEncaissement)
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
                                    Solde initial au ${caisse.lignes[0].date
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

        sheet.lastRow.font = { bold: true, size: 12 };

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


async function genererPdfCloture(data, datedebut, datefin,) {
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

async function genererDocPdf(data) {
    const templatePath = path.join(__dirname, '../../views/templates/doc-justif.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Remplacement des données simples
    html = html
        .replace('{{logo}}', (data.operation.code || 'O').charAt(0).toUpperCase())
        .replace('{{societe}}', data.operation.code || 'Entreprise')
        .replace('{{site}}', data.operation.beneficiaire ? 'Bénéficiaire : ' + data.operation.beneficiaire : '')
        .replace('{{operation_code}}', data.operation.code || '')
        .replace('{{operation_date}}', data.operation.date || '')
        .replace('{{beneficiaire}}', data.operation.beneficiaire || '');

    // Synthèse
    const syntheseRows = `
        <tr>
            <td>Montant décaissement</td>
            <td class="right">${(data.synthese.montantDecaissement || 0).toLocaleString()}</td>
            <td class="right">${(data.synthese.montantDecaissementRef || 0).toLocaleString()}</td>
        </tr>
        <tr>
            <td>Montant justifié</td>
            <td class="right">${(data.synthese.montantJustifie || 0).toLocaleString()}</td>
            <td class="right">${(data.synthese.montantJustifieRef || 0).toLocaleString()}</td>
        </tr>
        <tr>
            <td>Montant encaissement</td>
            <td class="right">${(data.synthese.montantEncaissement || 0).toLocaleString()}</td>
            <td class="right">${(data.synthese.montantEncaissementRef || 0).toLocaleString()}</td>
        </tr>
        <tr style="font-weight:bold; background:#eef2ff;">
            <td>Reste à justifier</td>
            <td class="right">${(data.synthese.resteAJustifier || 0).toLocaleString()}</td>
            <td class="right">${(data.synthese.resteAJustifierRef || 0).toLocaleString()}</td>
        </tr>
    `;
    html = html.replace('{{synthese_rows}}', syntheseRows);

    // Décaissement
    html = html.replace('{{decaissement_rows}}', data.decaissement.map(d => `
        <tr>
            <td>${d.nature || ''} - ${d.libelle || ''}</td>
            <td>${d.codecentre || ''} ${d.centre || ''}</td>
            <td class="right">${(d.montant || 0).toLocaleString()} ${d.devise || ''}</td>
            <td>${d.caisse || ''}</td>
        </tr>
    `).join(''));

    // Justificatifs (chaque bloc avec son tableau de détails)
    const justifBlocks = data.justificatifs.map(j => `
        <div class="justif-block">
            <div class="justif-header">
                <span>Code : ${j.code || ''}</span>
                <span>Date : ${j.date ? new Date(j.date).toLocaleDateString('fr-FR') : ''}</span>
                <span>Montant : ${(j.montant || 0).toLocaleString()} ${j.devise || ''}</span>
            </div>
            ${j.commentaire ? `<div style="margin-bottom:6px; font-style:italic; color:#475569;">${j.commentaire}</div>` : ''}
            <table>
                <thead>
                    <tr>
                        <th>Nature</th>
                        <th>Centre</th>
                        <th class="right">Montant</th>
                        <th class="right">Montant Ref</th>
                    </tr>
                </thead>
                <tbody>
                    ${j.details.map(d => `
                        <tr>
                            <td>${d.nature || ''}</td>
                            <td>${d.codecentre || ''} ${d.centre || ''}</td>
                            <td class="right">${(d.montant || 0).toLocaleString()}</td>
                            <td class="right">${(d.montantRef || 0).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `).join('');

    html = html.replace('{{justificatifs_sections}}', justifBlocks || '<p>Aucun justificatif</p>');

    // Encaissements
    html = html.replace('{{encaissement_rows}}', data.encaissements.map(e => `
        <tr>
            <td>${e.code || ''}</td>
            <td>${e.date ? new Date(e.date).toLocaleDateString('fr-FR') : ''}</td>
            <td>${e.caisse || ''} (${e.codecaisse || ''})</td>
            <td class="right">${(e.montant || 0).toLocaleString()} ${e.devise || ''}</td>
            <td class="right">${(e.montantRef || 0).toLocaleString()}</td>
        </tr>
    `).join(''));

    // Lancement du navigateur
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const buffer = await page.pdf({
        format: 'A4',
        margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
        printBackground: true,
    });

    await browser.close();
    return buffer;
}

module.exports = {
    genererPdfRecu, genererPdfJournal, genererXlsxJournal
    , genererPdfCloture, genererDocPdf
};
