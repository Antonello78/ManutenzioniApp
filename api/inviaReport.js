// /api/inviaReport.js

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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


        // --- 1. Generazione del corpo dell'email (Testo HTML) ---
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
                    .header { background-color: #1e40af; color: white; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; }
                    .details, .summary { margin-top: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
                    .detail-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted #eee; }
                    .summary { background-color: #dbeafe; font-size: 1.2em; font-weight: bold; text-align: center; padding: 10px 0; }
                    .total { font-size: 1.5em; color: #1e40af; }
                    .logo-container { text-align: center; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    
                    <div class="logo-container">
                        <img src="https://raw.githubusercontent.com/Antonello78/ManutenzioniApp/6d4ebdefb301ca8a1fe41627af387efd5b142665/LOGO%20ANTONELLO.png" 
                             alt="Logo Aziendale" 
                             style="max-width: 150px; height: auto;">
                    </div>
                    
                    <div class="header">
                        <h2>Riepilogo Dati di Fatturazione</h2>
                    </div>
                    
                    <h3>Dettagli Intervento</h3>
                    <div class="details">
                        <div class="detail-row"><span>N° Intervento:</span><strong>${nIntervento}</strong></div>
                        <div class="detail-row"><span>Data:</span><strong>${dataIntervento}</strong></div>
                        <div class="detail-row"><span>Scuola:</span><strong>${nomeScuola}</strong></div>
                        <div class="detail-row"><span>Plesso/Edificio:</span><strong>${plessoEdificio || 'N/A'}</strong></div>
                        <div class="detail-row"><span>Orario Lavorato:</span><strong>${orario}</strong></div>
                        <div class="detail-row"><span>Operai:</span><strong>${operai}</strong></div>
                    </div>
                    
                    <h3>Dettagli Calcolo</h3>
                    <div class="details">
                        <div class="detail-row"><span>Tariffa Oraria Applicata:</span><strong>${tariffa}</strong></div>
                        <div class="detail-row"><span>Tempo Fatturabile:</span><strong>${minutiFatturabili}</strong></div>
                        <div class="detail-row"><span>Costo di Uscita (Incl. 1ª Ora):</span><strong>${costoUscita}</strong></div>
                        <div class="detail-row"><span>Manodopera Aggiuntiva:</span><strong>${costoAggiuntivo}</strong></div>
                    </div>

                    <div class="summary">
                        <p>TOTALE MANODOPERA:</p> 
                        <span class="total">${totale}</span>
                    </div>

                    <p style="margin-top: 30px; font-size: 0.8em; color: #666; text-align: center;">
                        Email generata automaticamente.
                    </p>
                </div>
            </body>
            </html>
        `;

        // --- 2. Invio Email tramite Resend ---

        const { data, error } = await resend.emails.send({
            from: 'Report Interventi <onboarding@resend.dev>', 
            to: [destinatario],
            subject: `Riepilogo Intervento N° ${nIntervento} - ${nomeScuola}`,
            html: htmlContent,
            text: `Riepilogo Intervento N° ${nIntervento}. Totale: ${totale}`
        });

        if (error) {
            console.error('Errore Resend:', error);
            return res.status(500).json({ 
                message: 'Invio email fallito. Controlla i log Vercel e la configurazione Resend.', 
                error: error.message 
            });
        }

        return res.status(200).json({ message: 'Report inviato con successo!', data: data });

    } catch (error) {
        console.error('Errore inviaReport:', error);
        return res.status(500).json({ 
            message: 'Errore interno del server durante l\'elaborazione del report.', 
            error: error.message 
        });
    }
}

