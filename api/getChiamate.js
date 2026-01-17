// /api/getChiamate.js

import { getChiamateComplete } from './db.js';

export default async function handler(req, res) {
    // Accettiamo solo GET per recuperare i dati
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Metodo non consentito. Usa GET.' });
    }

    try {
        // Chiamiamo la funzione che abbiamo aggiunto in db.js
        const chiamate = await getChiamateComplete();
        
        // Restituiamo la lista delle chiamate al frontend
        return res.status(200).json({ chiamate: chiamate });

    } catch (error) {
        console.error('Errore nel recupero delle chiamate:', error);
        return res.status(500).json({ 
            message: 'Errore durante il recupero del registro chiamate.' 
        });
    }
}
