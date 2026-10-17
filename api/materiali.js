// /api/materiali.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const { method } = req;

    try {
        switch (method) {
            case 'GET':
                // Recupera tutti gli articoli salvati con chiave "materiale:*"
                const keys = await kv.keys('materiale:*');
                if (keys.length === 0) return res.status(200).json([]);
                
                const articoli = await kv.mget(...keys);
                return res.status(200).json(articoli.filter(a => a !== null));

            case 'POST':
            case 'PUT':
                const articolo = req.body;
                if (!articolo.id) {
                    articolo.id = Date.now().toString();
                }
                
                // Salva o aggiorna l'articolo
                await kv.set(`materiale:${articolo.id}`, articolo);
                return res.status(200).json(articolo);

            case 'DELETE':
                const { id } = req.query;
                if (!id) return res.status(400).json({ error: 'ID mancante' });
                
                await kv.del(`materiale:${id}`);
                return res.status(200).json({ message: 'Articolo eliminato con successo' });

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).end(`Metodo ${method} non consentito`);
        }
    } catch (error) {
        console.error('Errore API Materiali:', error);
        return res.status(500).json({ error: 'Errore interno del server' });
    }
}
