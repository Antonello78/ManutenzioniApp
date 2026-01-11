// /api/getArchivio.js (oppure caricaInterventi.js)

import { getArchivioCompleto } from './db.js';

export default async function handler(req, res) {
    try {
        const interventi = await getArchivioCompleto();
        
        return res.status(200).json({ interventi: interventi });
    } catch (error) {
        console.error('Errore getArchivio:', error);
        return res.status(500).json({ message: 'Errore nel recupero dell\'archivio.' });
    }
}

