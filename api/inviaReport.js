import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Metodo non consentito.' });

    try {
        const { nIntervento, nomeScuola, destinatario, pdfBase64 } = req.body;

        if (!destinatario || !pdfBase64) {
            return res.status(400).json({ message: 'Dati mancanti (destinatario o allegato).' });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        const mailOptions = {
            from: `"Manutenzioni D'Angelo" <${process.env.GMAIL_USER}>`,
            to: destinatario,
            subject: `Report Intervento N° ${nIntervento} - ${nomeScuola}`,
            text: `Gentile Referente,\n\nin allegato alla presente inviamo il report relativo all'intervento di manutenzione N° ${nIntervento} effettuato presso ${nomeScuola}.\n\nCordiali saluti,\n\nAntonello D'Angelo`,
            attachments: [
                {
                    filename: `Report_Intervento_${nIntervento.replace('/', '-')}.pdf`,
                    content: pdfBase64,
                    encoding: 'base64'
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Email inviata con successo con allegato PDF!' });

    } catch (error) {
        console.error('Errore invio email:', error);
        return res.status(500).json({ message: 'Errore invio email.', error: error.message });
    }
}
