import { getRegistroChiamateKV } from './db.js';

export default async function handler(req, res) {
    try {
        const chiamate = await getRegistroChiamateKV();
        // Ordiniamo per priorità (Urgenti prima)
        const ordinate = chiamate.sort((a, b) => {
            const priorita = { 'alta': 1, 'media': 2, 'bassa': 3 };
            return priorita[a.priorita] - priorita[b.priorita];
        });
        return res.status(200).json(ordinate);
    } catch (error) {
        return res.status(500).json({ message: 'Errore recupero registro.' });
    }
}
