import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const { nIntervento, nomeScuola, destinatario, pdfBase64 } = req.body;

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
        subject: `Intervento N° ${nIntervento} - ${nomeScuola}`,
        text: `In allegato il riepilogo dell'intervento N° ${nIntervento}.`,
        attachments: [
            {
                filename: `Intervento_${nIntervento.replace('/', '-')}.pdf`,
                content: pdfBase64,
                encoding: 'base64'
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Inviato!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
