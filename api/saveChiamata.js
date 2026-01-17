// /api/saveChiamata.js

import { saveChiamataKV } from './db.js';

export default async function handler(req, res) {
    // Accettiamo solo POST per salvare i dati
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Metodo non consentito. Usa POST.' });
    }

    try {
        const { chiamata } = req.body;

        if (!chiamata || !chiamata.id) {
            return res.status(400).json({ message: 'Dati chiamata o ID mancanti.' });
        }

        // Salviamo la chiamata su Vercel KV usando la funzione in db.js
        await saveChiamataKV(chiamata);

        return res.status(200).json({ 
            message: 'Chiamata registrata con successo nel registro.',
            id: chiamata.id 
        });

    } catch (error) {
        console.error('Errore nel salvataggio chiamata:', error);
        return res.status(500).json({ 
            message: 'Errore interno durante il salvataggio della chiamata.' 
        });
    }
}
