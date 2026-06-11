// /api/getDrivePdf.js
import { google } from 'googleapis';

export default async function handler(req, res) {
    // Permettiamo solo richieste GET per recuperare il link
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Metodo non consentito. Usa GET.' });
    }

    // Leggiamo il numero dell'intervento e l'anno passati dall'app (es: ?numero=117&anno=26)
    const { numero, anno } = req.query;

    if (!numero || !anno) {
        return res.status(400).json({ message: 'Parametri numero e anno mancanti.' });
    }

    try {
        // 1. Configurazione delle credenziali del Service Account tramite variabili d'ambiente di Vercel
        // Sostituiamo i caratteri di a capo '\n' che a volte si rovinano nelle impostazioni di testo
        const privateKey = process.env.DRIVE_PRIVATE_KEY ? process.env.DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined;
        const clientEmail = process.env.DRIVE_CLIENT_EMAIL;
        const folderId = process.env.DRIVE_FOLDER_ID; // L'ID della tua cartella specifica su Drive

        if (!privateKey || !clientEmail || !folderId) {
            return res.status(500).json({ message: 'Configurazione di Google Drive incompleta sul server (Variabili d\'ambiente mancanti).' });
        }

        const auth = new google.auth.JWT(
            clientEmail,
            null,
            privateKey,
            ['https://www.googleapis.com/auth/drive.readonly'] // Accesso in sola lettura per massima sicurezza
        );

        const drive = google.drive({ version: 'v3', auth });

        // 2. Prepariamo la query di ricerca per trovare il file (es: name starts with '117_26' e si trova nella cartella specifica)
        const prefissoFile = `${numero}_${anno}`;
        const q = `'${folderId}' in parents and name contains '${prefissoFile}' and mimeType = 'application/pdf' and trashed = false`;

        // 3. Interroghiamo Google Drive
        const response = await drive.files.list({
            q: q,
            fields: 'files(id, name, webViewLink)',
            pageSize: 1
        });

        const files = response.data.files;

        if (files && files.length > 0) {
            // Abbiamo trovato il file! Restituiamo il link per aprirlo
            return res.status(200).json({ 
                trovato: true, 
                link: files[0].webViewLink,
                nomeFile: files[0].name 
            });
        } else {
            // Nessun file scansionato trovato per questo intervento
            return res.status(200).json({ trovato: false, message: 'Nessun report scansionato trovato su Drive.' });
        }

    } catch (error) {
        console.error('Errore durante la ricerca su Google Drive:', error);
        return res.status(500).json({ message: 'Errore interno nel controllo di Google Drive.' });
    }
}
