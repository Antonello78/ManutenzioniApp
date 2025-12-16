// /api/getNextNumber.js (oppure getContatore.js se lo hai già)

import { getContatoreKV } from './db';

export default async function handler(req, res) {
    const { anno } = req.query; // Legge l'anno dall'URL (?anno=25)

    if (!anno) {
        return res.status(400).json({ message: 'Anno mancante.' });
    }

    try {
        const ultimoNumero = await getContatoreKV(anno);
        // Restituisce l'ULTIMO NUMERO USATO (es. 075). Il frontend aggiungerà +1
        return res.status(200).json({ numero: ultimoNumero }); 
    } catch (error) {
        console.error('Errore getNextNumber:', error);
        return res.status(500).json({ message: 'Errore nel recupero del contatore.' });
    }
}
