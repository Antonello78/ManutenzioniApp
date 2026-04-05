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
            materialiUtilizzati,
            orario, operai, tariffa, minutiFatturabili, 
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
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 20px; background-color: #f8fafc; }
                    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
                    
                    /* Header Professionale */
                    .header { background: #1e40af; color: #ffffff; padding: 30px 20px; text-align: center; }
                    .header h2 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; }
                    .header p { margin: 5px 0 0 0; opacity: 0.9; font-size: 14px; }

                    .content { padding: 25px; }

                    /* Sezioni Unificate (Card) */
                    .card { margin-bottom: 20px; padding: 15px; background: #fcfcfc; border: 1px solid #e2e8f0; border-left: 4px solid #1e40af; border-radius: 6px; }
                    .card-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #1e40af; margin-bottom: 8px; display: block; letter-spacing: 0.5px; }
                    .card-body { font-size: 15px; color: #1e293b; }
                    .text-muted { font-size: 14px; color: #64748b; font-style: italic; white-space: pre-wrap; }

                    /* Tabella Dati Unificata */
                    .data-table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                    .data-row { border-bottom: 1px solid #f1f5f9; }
                    .data-row:last-child { border-bottom: none; }
                    .data-label { padding: 10px 0; font-size: 13px; color: #64748b; width: 50%; }
                    .data-value { padding: 10px 0; font-size: 14px; color: #0f172a; text-align: right; font-weight: 600; }

                    /* Box Totale */
                    .total-box { margin-top: 25px; background: #eff6ff; border: 2px solid #1e40af; border-radius: 10px; padding: 20px; text-align: center; }
                    .total-label { display: block; font-size: 12px; font-weight: 800; color: #1e40af; text-transform: uppercase; margin-bottom: 5px; }
                    .total-amount { font-size: 30px; font-weight: 800; color: #1e40af; }

                    /* Footer */
                    .footer { padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; background: #fafafa; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Rapporto Intervento</h2>
                        <p>Intervento N° ${nIntervento} — Protocollo del ${dataIntervento}</p>
                    </div>

                    <div class="content">
                        <div class="card">
                            <span class="card-title">Ente / Scuola</span>
                            <div class="card-body">
                                <strong>${nomeScuola}</strong>
                                ${plessoEdificio ? `<div style="font-size: 13px; color: #64748b; margin-top: 2px;">Plesso: ${plessoEdificio}</div>` : ''}
                            </div>
                        </div>

                        <div class="card">
                            <span class="card-title">Descrizione Lavori</span>
                            <div class="text-muted">${descrizioneLavori || 'Nessuna descrizione fornita.'}</div>
                        </div>

                        <div class="card">
                            <span class="card-title">Materiali Utilizzati</span>
                            <div class="text-muted">${materialiUtilizzati || 'Nessun materiale utilizzato.'}</div>
                        </div>

                        <div class="card">
                            <span class="card-title">Dettagli Tecnici e Costi</span>
                            <table class="data-table">
                                <tr class="data-row"><td class="data-label">Orario e Durata</td><td class="data-value">${orario}</td></tr>
                                <tr class="data-row"><td class="data-label">Operai Impiegati</td><td class="data-value">${operai}</td></tr>
                                <tr class="data-row"><td class="data-label">Tariffa Base</td><td class="data-value">${tariffa}</td></tr>
                                <tr class="data-row"><td class="data-label">Minuti Fatturabili</td><td class="data-value">${minutiFatturabili}</td></tr>
                                <tr class="data-row"><td class="data-label">Costo Uscita / 1ª Ora</td><td class="data-value">${costoUscita}</td></tr>
                                <tr class="data-row"><td class="data-label">Quota Manodopera Extra</td><td class="data-value">${costoAggiuntivo}</td></tr>
                            </table>
                        </div>

                        <div class="total-box">
                            <span class="total-label">Totale Imponibile Intervento</span>
                            <span class="total-amount">${totale}</span>
                        </div>
                    </div>

                    <div class="footer">
                        <strong>Ditta D'Angelo Antonello</strong><br>
                        Sistema Automatico di Notifica — v1.4.0 (Release 2026)
                    </div>
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
