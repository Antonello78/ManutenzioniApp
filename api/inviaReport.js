// /api/inviaReport.js
import nodemailer from 'nodemailer';

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
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #f1f5f9; margin: 0; padding: 20px; }
                    .letter-container { max-width: 650px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                    
                    /* Parte 1: Testo di accompagnamento */
                    .intro-section { margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 30px; }
                    .intro-section p { font-size: 16px; margin: 10px 0; color: #1e293b; }
                    
                    /* Parte 2: Il Documento Tecnico (Grafica integrata) */
                    .document-box { border: 2px solid #e2e8f0; border-radius: 6px; overflow: hidden; background: #fff; }
                    .document-header { background: #1e40af; color: #ffffff; padding: 15px; text-align: center; }
                    .document-header h3 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; }
                    
                    .document-body { padding: 25px; }
                    
                    /* Card interna per dati brevi */
                    .doc-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .doc-row { border-bottom: 1px solid #f1f5f9; }
                    .doc-label { padding: 10px 0; font-size: 12px; color: #64748b; font-weight: bold; width: 40%; text-transform: uppercase; }
                    .doc-value { padding: 10px 0; font-size: 14px; color: #0f172a; text-align: right; font-weight: 600; }
                    
                    /* Box per testi lunghi (Descrizione e Materiali) */
                    .section-header { font-size: 12px; font-weight: 800; color: #1e40af; text-transform: uppercase; margin-bottom: 8px; margin-top: 20px; }
                    .doc-longtext { background: #f8fafc; padding: 15px; border-radius: 6px; font-size: 14px; color: #334155; border: 1px solid #e2e8f0; font-style: italic; white-space: pre-wrap; margin-bottom: 20px; }
                    
                    /* Box Totale */
                    .total-badge { background: #1e40af; color: white; padding: 25px; text-align: center; margin-top: 25px; border-radius: 6px; }
                    .total-badge span { display: block; font-size: 11px; text-transform: uppercase; opacity: 0.9; letter-spacing: 1px; margin-bottom: 5px; }
                    .total-badge strong { font-size: 32px; font-weight: 800; }

                    .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 40px; line-height: 1.4; }
                </style>
            </head>
            <body>
                <div class="letter-container">
                    
                    <div class="intro-section">
                        <p>Spett.le <strong>${nomeScuola}</strong>,</p>
                        <p>con la presente si trasmette formalmente il riepilogo tecnico relativo all'intervento di manutenzione eseguito in data <strong>${dataIntervento}</strong> presso la Vostra sede.</p>
                        <p>Il dettaglio completo delle prestazioni e dei materiali è riportato nel prospetto informativo qui sotto integrato.</p>
                        <p>Restiamo a Vostra completa disposizione per eventuali chiarimenti.<br>Distinti saluti.</p>
                        <p><strong>Ditta D'Angelo Antonello</strong></p>
                    </div>

                    <div class="document-box">
                        <div class="document-header">
                            <h3>Rapporto di Intervento N° ${nIntervento}</h3>
                        </div>
                        <div class="document-body">
                            <table class="doc-table">
                                <tr class="doc-row"><td class="doc-label">Destinatario</td><td class="doc-value">${nomeScuola}</td></tr>
                                ${plessoEdificio ? `<tr class="doc-row"><td class="doc-label">Plesso/Edificio</td><td class="doc-value">${plessoEdificio}</td></tr>` : ''}
                                <tr class="doc-row"><td class="doc-label">Data Intervento</td><td class="doc-value">${dataIntervento}</td></tr>
                            </table>

                            <div class="section-header">Descrizione Lavorazioni</div>
                            <div class="doc-longtext">${descrizioneLavori || 'Nessuna descrizione fornita.'}</div>

                            <div class="section-header">Materiali e Ricambi Utilizzati</div>
                            <div class="doc-longtext">${materialiUtilizzati || 'Nessun materiale utilizzato.'}</div>

                            <div class="section-header">Dettaglio Manodopera e Costi</div>
                            <table class="doc-table">
                                <tr class="doc-row"><td class="doc-label">Orario Servizio</td><td class="doc-value">${orario}</td></tr>
                                <tr class="doc-row"><td class="doc-label">Operai Impiegati</td><td class="doc-value">${operai}</td></tr>
                                <tr class="doc-row"><td class="doc-label">Tempo Fatturabile</td><td class="doc-value">${minutiFatturabili}</td></tr>
                                <tr class="doc-row"><td class="doc-label">Tariffa Applicata</td><td class="doc-value">${tariffa}</td></tr>
                                <tr class="doc-row"><td class="doc-label">Quota Fissa Uscita</td><td class="doc-value">${costoUscita}</td></tr>
                                <tr class="doc-row"><td class="doc-label">Manodopera Extra</td><td class="doc-value">${costoAggiuntivo}</td></tr>
                            </table>

                            <div class="total-badge">
                                <span>Totale Imponibile Manodopera</span>
                                <strong>${totale}</strong>
                            </div>
                        </div>
                    </div>

                    <div class="footer">
                        <strong>Ditta D'Angelo Antonello</strong><br>
                        Sistema Automatico Notifiche Report — v1.4.0 (2026)<br>
                        <em>Si prega di non rispondere a questa email generata automaticamente.</em>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        const mailOptions = {
            from: `"Ditta D'Angelo Antonello" <${process.env.GMAIL_USER}>`,
            to: destinatario,
            subject: `Rapporto Intervento N° ${nIntervento} - ${nomeScuola}`,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Report inviato con successo!' });

    } catch (error) {
        console.error('Errore inviaReport:', error);
        return res.status(500).json({ message: 'Errore durante l\'invio dell\'email.' });
    }
}
