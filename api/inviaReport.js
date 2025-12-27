// /api/inviaReport.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Metodo non consentito. Usa POST.' });
    }

    try {
        const reportData = req.body;
        
        const { 
            nIntervento, dataIntervento, nomeScuola, plessoEdificio, 
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
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; }
                    .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; }
                    .section-title { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 5px; margin-top: 20px; font-weight: bold; }
                    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px id="f9f9f9" solid; }
                    .summary { background-color: #eff6ff; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: right; }
                    .total { font-size: 1.5em; color: #1e40af; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Riepilogo Intervento</h1>
                        <p>Ditta Edile D'Angelo Antonello</p>
                    </div>
                    <div class="content">
                        <div class="section-title">DETTAGLI INTERVENTO</div>
                        <div class="detail-row"><span>N° Intervento:</span><strong>${nIntervento}</strong></div>
                        <div class="detail-row"><span>Data:</span><strong>${dataIntervento}</strong></div>
                        <div class="detail-row"><span>Scuola:</span><strong>${nomeScuola}</strong></div>
                        <div class="detail-row"><span>Plesso:</span><strong>${plessoEdificio || '---'}</strong></div>
                        <div class="detail-row"><span>Orario:</span><strong>${orario}</strong></div>
                        <div class="detail-row"><span>Operai:</span><strong>${operai}</strong></div>

                        <div class="section-title">RIEPILOGO DATI DI FATTURAZIONE MANODOPERA</div>
                        <div class="detail-row"><span>Tariffa Oraria:</span><strong>${tariffa}</strong></div>
                        <div class="detail-row"><span>Tempo Fatturabile:</span><strong>${minutiFatturabili}</strong></div>
                        <div class="detail-row"><span>Costo Uscita (Incl. 1ª Ora):</span><strong>${costoUscita}</strong></div>
                        <div class="detail-row"><span>Manodopera Aggiuntiva:</span><strong>${costoAggiuntivo}</strong></div>
                    </div>
                    <div class="summary">
                        <p>TOTALE MANODOPERA:</p> 
                        <span class="total">${totale}</span>
                    </div>

                    <p style="margin-top: 30px; font-size: 0.8em; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
                        Email inviata tramite sistema automatico Manutenzioni D'Angelo.<br>
                        <span style="font-size: 0.9em; font-weight: bold;">Versione Software: v1.1.2</span>
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
        return res.status(500).json({ message: 'Errore durante l\'invio della mail.' });
    }
}
