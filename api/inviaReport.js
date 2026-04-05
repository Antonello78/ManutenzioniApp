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

        // Funzione interna per formattare la data in formato italiano (GG/MM/AAAA)
        const formatDateIT = (dateStr) => {
            if (!dateStr) return '';
            const parts = dateStr.split('-');
            if (parts.length !== 3) return dateStr; 
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        };

        const dataItaliana = formatDateIT(dataIntervento);

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
                    
                    .intro-section { margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 30px; }
                    .intro-section p { font-size: 16px; margin: 10px 0; color: #1e293b; }
                    
                    .document-box { border: 2px solid #e2e8f0; border-radius: 6px; overflow: hidden; background: #fff; }
                    .document-header { background: #1e40af; color: #ffffff; padding: 15px; text-align: center; }
                    .document-header h3 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; }
                    
                    .document-body { padding: 25px; }
                    .doc-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .doc-row { border-bottom: 1px solid #f1f5f9; }
                    .doc-label { padding: 10px 0; font-size: 12px; color: #64748b; font-weight: bold; width: 40%; text-transform: uppercase; }
                    .doc-value { padding: 10px 0; font-size: 14px; color: #0f172a; text-align: right; font-weight: 600; }
                    
                    .section-header { font-size: 12px; font-weight: 800; color: #1e40af; text-transform: uppercase; margin-bottom: 8px; margin-top: 20px; }
                    .doc-longtext { background: #f8fafc; padding: 15px; border-radius: 6px; font-size: 14px; color: #334155; border: 1px solid #e2e8f0; font-style: italic; white-space: pre-wrap; margin-bottom: 20px; }
                    
                    .total-badge { background: #1e40af; color: white; padding: 25px; text-align: center; margin-top: 25px; border-radius: 6px; }
                    .total-badge span { display: block; font-size: 11px; text-transform: uppercase; opacity: 0.9; letter-spacing: 1px; margin-bottom: 5px; }
                    .total-badge strong { font-size: 32px; font-weight: 800; }

                    .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 40px; }
                </style>
            </head>
            <body>
                <div class="letter-container">
                    
                    <div class="intro-section">
                        <p>Alla c.a. del <strong>D.S.G.A.</strong>,</p>
                        <p>con la presente si trasmette il riepilogo tecnico relativo all'intervento di manutenzione <strong>N° ${nIntervento}</strong>, eseguito in data <strong>${dataItaliana}</strong> presso l'Istituto <strong>${nomeScuola}</strong>.</p>
                        <p>Il dettaglio completo delle lavorazioni, dei materiali e dei costi è riportato nel prospetto informativo sottostante.</p>
                        <p>Restiamo a disposizione per ogni eventuale necessità.<br>Cordiali saluti.</p>
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
                            <div class="doc-longtext">${descrizioneLavori || 'Nessuna descrizione fornita.'}</div>

                            <div class="section-header">Materiali Utilizzati</div>
                            <div class="doc-longtext">${materialiUtilizzati || 'Nessun materiale utilizzato.'}</div>

                            <div class="section-header">Dettaglio Manodopera</div>
                            <table class="doc-table">
                                <tr class="doc-row"><td class="doc-label">Orario</td><td class="doc-value">${orario}</td></tr>
                                <tr class="doc-row"><td class="doc-label">Operai</td><td class="doc-value">${operai}</td></tr>
                                <tr class="doc-row"><td class="doc-label">Tempo Fatturabile</td><td class="doc-value">${minutiFatturabili}</td></tr>
                                <tr class="doc-row"><td class="doc-label">Costo Uscita</td><td class="doc-value">${costoUscita}</td></tr>
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
                        Sistema Automatico Notifiche — v1.4.0 (2026)
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
