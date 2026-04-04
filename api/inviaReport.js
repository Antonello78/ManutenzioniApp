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
            materialiUtilizzati, // <--- AGGIUNTO QUESTO
            orario, operai, tariffa, minutiFatturabili, 
            costoUscita, costoAggiuntivo, totale, destinatario 
        } = reportData;
        
        if (!destinatario) {
             return res.status(400).json({ message: 'Indirizzo email di destinazione mancante.' });
        }

        // --- Configurazione Nodemailer per Gmail ---
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
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { width: 100%; max-width: 650px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; }
                    .header { background: #1d4ed8; color: #fff; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; }
                    .section { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px; border: 1px solid #eee; }
                    .section-title { font-weight: bold; font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 5px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
                    .value { font-size: 15px; color: #111; font-weight: 500; }
                    .italic-val { font-style: italic; white-space: pre-wrap; font-size: 14px; }
                    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
                    .detail-row { border-bottom: 1px dashed #eee; padding: 5px 0; display: flex; justify-content: space-between; }
                    .summary { margin-top: 20px; background: #fffde7; padding: 15px; border: 2px solid #fbc02d; border-radius: 8px; text-align: center; }
                    .total { font-size: 24px; font-weight: bold; color: #d32f2f; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2 style="margin: 0;">Riepilogo Intervento</h2>
                        <p style="margin: 5px 0 0 0;">N° ${nIntervento} — ${dataIntervento}</p>
                    </div>

                    <div style="margin-top: 20px;">
                        <div class="section">
                            <div class="section-title">Ente / Scuola</div>
                            <div class="value">${nomeScuola}</div>
                            ${plessoEdificio ? `<div class="value" style="font-size: 13px; color: #666;">Plesso: ${plessoEdificio}</div>` : ''}
                        </div>

                        <div class="section">
                            <div class="section-title">Descrizione Lavori</div>
                            <div class="italic-val">${descrizioneLavori || '---'}</div>
                        </div>

                        <div class="section" style="border-left: 4px solid #1d4ed8;">
                            <div class="section-title" style="color: #1d4ed8;">Materiali Utilizzati</div>
                            <div class="italic-val">${materialiUtilizzati || 'Nessun materiale specificato'}</div>
                        </div>
                        <div class="section">
                            <div class="section-title">Dettagli Tecnici</div>
                            <div class="detail-row"><span>Orario:</span><strong>${orario}</strong></div>
                            <div class="detail-row"><span>Personale:</span><strong>${operai} Operaio/i</strong></div>
                            <div class="detail-row"><span>Tariffa Oraria:</span><strong>${tariffa}</strong></div>
                            <div class="detail-row"><span>Minuti Fatturabili:</span><strong>${minutiFatturabili}</strong></div>
                        </div>

                        <div class="section">
                            <div class="section-title">Costi</div>
                            <div class="detail-row"><span>Costo Uscita (1ª Ora):</span><strong>${costoUscita}</strong></div>
                            <div class="detail-row"><span>Manodopera Aggiuntiva:</span><strong>${costoAggiuntivo}</strong></div>
                        </div>
                    </div>
                    
                    <div class="summary">
                        <p style="margin: 0; font-weight: bold;">TOTALE MANODOPERA:</p> 
                        <span class="total">${totale}</span>
                    </div>

                    <p style="margin-top: 30px; font-size: 0.8em; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
                        Email inviata tramite sistema automatico Ditta D'Angelo Antonello.<br>
                        <span style="font-size: 0.9em; font-weight: bold;">v1.4.0 (Release 2026)</span>
                    </p>
                </div>
            </body>
            </html>
        `;
        
        const mailOptions = {
            from: `"Report Interventi" <${process.env.GMAIL_USER}>`,
            to: destinatario,
            subject: `Riepilogo Intervento N° ${nIntervento} - ${nomeScuola}`,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Report inviato con successo!' });

    } catch (error) {
        console.error('Errore inviaReport:', error);
        return res.status(500).json({ message: 'Errore durante l\'invio dell\'email.' });
    }
}
