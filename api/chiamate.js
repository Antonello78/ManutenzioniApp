import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const { method } = req;

    try {
        switch (method) {
            case 'GET':
                // Recupera tutte le chiavi che iniziano con 'chiamata:'
                const keys = await kv.keys('chiamata:*');
                if (keys.length === 0) return res.status(200).json([]);
                
                // Recupera i dettagli di tutte le chiamate
                const chiamate = await kv.mget(...keys);
                // Ordina per data (le più recenti sopra) o per priorità
                return res.status(200).json(chiamate.filter(c => c !== null));

            case 'POST':
                const nuovaChiamata = req.body;
                // Usiamo un timestamp come ID univoco
                const id = Date.now();
                nuovaChiamata.id = id;
                await kv.set(`chiamata:${id}`, nuovaChiamata);
                return res.status(201).json(nuovaChiamata);

            case 'PUT':
                const chiamataAggiornata = req.body;
                if (!chiamataAggiornata.id) throw new Error('ID mancante');
                await kv.set(`chiamata:${chiamataAggiornata.id}`, chiamataAggiornata);
                return res.status(200).json(chiamataAggiornata);

            case 'DELETE':
                const { id: idElimina } = req.query;
                await kv.del(`chiamata:${idElimina}`);
                return res.status(200).json({ message: 'Chiamata eliminata' });

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).end(`Metodo ${method} non consentito`);
        }
    } catch (error) {
        console.error('Errore API Chiamate:', error);
        return res.status(500).json({ error: error.message });
    }
}
