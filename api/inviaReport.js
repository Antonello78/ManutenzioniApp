// /api/inviaReport.js
import nodemailer from 'nodemailer';
import path from 'path';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Metodo non consentito. Usa POST.' });
    }

    try {
        const reportData = req.body;
        
        const { 
            nIntervento, dataIntervento, nomeScuola, plessoEdificio, descrizioneLavori, 
            materialiUtilizzati, orario, operai, tariffa, minutiFatturabili, 
            costoUscita, costoAggiuntivo, totale, destinatario 
        } = reportData;
        
        if (!destinatario) {
             return res.status(400).json({ message: 'Indirizzo email di destinazione mancante.' });
        }

        // Funzione per data in formato italiano
        const formatDateIT = (dateStr) => {
            if (!dateStr) return '';
            const parts = dateStr.split('-');
            if (parts.length !== 3) return dateStr; 
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        };

        const dataItaliana = formatDateIT(dataIntervento);
        const istitutoCompleto = plessoEdificio ? `${nomeScuola} - Plesso: ${plessoEdificio}` : nomeScuola;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER, 
                pass: process.env.GMAIL_APP_PASSWORD 
            }
        });

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.4; color: #334155; background-color: #f1f5f9; margin: 0; padding: 15px; }
                    .letter-container { max-width: 650px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; }
                    
                    /* Logo Header */
                    .logo-header { text-align: left; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9; }
                    .logo-image { height: 70px; width: auto; }

                    /* Intro compatta */
                    .intro-section { margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; }
                    .intro-section p { font-size: 15px; margin: 6px 0; color: #1e293b; }
                    
                    /* Box Documento */
                    .document-box { border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; background: #fff; }
                    .document-header { background: #1e40af; color: #ffffff; padding: 8px; text-align: center; }
                    .document-header h3 { margin: 0; font-size: 16px; text-transform: uppercase; }
                    
                    .document-body { padding: 15px; }
                    .doc-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                    .doc-row { border-bottom: 1px solid #f8fafc; }
                    .doc-label { padding: 5px 0; font-size: 11px; color: #64748b; font-weight: bold; width: 40%; text-transform: uppercase; }
                    .doc-value { padding: 5px 0; font-size: 13px; color: #0f172a; text-align: right; font-weight: 600; }
                    
                    .section-header { font-size: 11px; font-weight: 800; color: #1e40af; text-transform: uppercase; margin-bottom: 4px; margin-top: 10px; }
                    .doc-longtext { background: #f8fafc; padding: 10px; border-radius: 4px; font-size: 13px; color: #334155; border: 1px solid #f1f5f9; font-style: italic; white-space: pre-wrap; margin-bottom: 8px; }
                    
                    .total-badge { background: #1e40af; color: white; padding: 15px; text-align: center; margin-top: 15px; border-radius: 4px; }
                    .total-badge span { display: block; font-size: 10px; text-transform: uppercase; opacity: 0.9; }
                    .total-badge strong { font-size: 26px; font-weight: 800; }

                    .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 25px; }
                    
                    @media print {
                        body { padding: 0; background: white; }
                        .letter-container { box-shadow: none; width: 100%; padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="letter-container">
                    
                    <div class="logo-header">
                        <img src="cid:logo_antonello" alt="Logo D'Angelo" class="logo-image" />
                    </div>

                    <div class="intro-section">
                        <p>Alla c.a. del <strong>D.S.G.A.</strong>,</p>
                        <p>con la presente si trasmette il riepilogo tecnico dell'intervento <strong>N° ${nIntervento}</strong>, eseguito in data <strong>${dataItaliana}</strong> presso l'Istituto <strong>${istitutoCompleto}</strong>.</p>
                        <p>Il dettaglio delle lavorazioni e dei costi è riportato nel prospetto sottostante.</p>
                        <p>Restiamo a disposizione per ogni necessità.<br>Cordiali saluti.</p>
                        <p><strong>Ditta D'Angelo Antonello</strong></p>
                    </div>

                    <div class="document-box">
                        <div class="document-header">
                            <h3>Rapporto di Intervento N° ${nIntervento}</h3>
                        </div>
                        <div class="document-body">
                            <table class="doc-table">
                                <tr class="doc-row"><td class="doc-label">Scuola</td><td class="doc-value">${nomeScuola}</td></tr>
                                ${plessoEdificio ? `<tr class="doc-row"><td class="doc-label">Plesso</td><td class="doc-value">${plessoEdificio}</td></tr>` : ''}
                                <tr class="doc-row"><td class="doc-label">Data</td><td class="doc-value">${dataItaliana}</td></tr>
                            </table>

                            <div class="section-header">Descrizione Lavorazioni</div>
                            <div class="doc-longtext">${descrizioneLavori || '-'}</div>

                            <div class="section-header">Materiali Utilizzati</div>
                            <div class="doc-longtext">${materialiUtilizzati || '-'}</div>

                            <div class="section-header">Dettaglio Manodopera</div>
                            <table class="doc-table">
                                <tr class="doc-row"><td class="doc-label">Orario</td><td class="doc-value">${orario}</td></tr>
                                <tr class="doc-row"><td class="doc-label">Operai</td><td class="doc-value">${operai}</td></tr>
                                <tr class="doc-row"><td class="doc-label">Costo Uscita</td><td class="doc-value">${costoUscita}</td></tr>
                                <tr class="doc-row"><td class="doc-label">Extra Manodopera</td><td class="doc-value">${costoAggiuntivo}</td></tr>
                            </table>

                            <div class="total-badge">
                                <span>Totale Imponibile Manodopera</span>
                                <strong>${totale}</strong>
                            </div>
                        </div>
                    </div>

                    <div class="footer">
                        <strong>Ditta D'Angelo Antonello</strong> - Manutenzioni Generali<br>
                        Sistema Automatico Notifiche — v1.4.0
                    </div>
                </div>
            </body>
            </html>
        `;
        
        const logoPath = path.join(process.cwd(), 'LOGO ANTONELLO.png');

        const mailOptions = {
            from: `"Ditta D'Angelo Antonello" <${process.env.GMAIL_USER}>`,
            to: destinatario,
            subject: `Rapporto Intervento N° ${nIntervento} - ${nomeScuola}`,
            html: htmlContent,
            attachments: [{
                filename: 'LOGO ANTONELLO.png',
                path: logoPath,
                cid: 'logo_antonello' 
            }]
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Report inviato con successo!' });

    } catch (error) {
        console.error('Errore inviaReport:', error);
        return res.status(500).json({ message: 'Errore durante l\'invio dell\'email.' });
    }
}
