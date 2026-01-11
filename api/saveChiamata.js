import { saveChiamataKV } from './db.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    try {
        const chiamata = req.body; // {id, scuola, problema, priorita, data}
        await saveChiamataKV(chiamata);
        return res.status(200).json({ message: 'Chiamata registrata.' });
    } catch (error) {
        return res.status(500).json({ message: 'Errore salvataggio chiamata.' });
    }
}
