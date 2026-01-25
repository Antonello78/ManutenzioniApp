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
                
                // FILTRO: Restituiamo solo le chiamate NON completate per il registro principale
                // Manteniamo la compatibilità con i vecchi dati (c.stato === undefined)
                const chiamateAttive = chiamate.filter(c => c !== null && c.stato !== 'completata');
                
                return res.status(200).json(chiamateAttive);

            case 'POST':
                const datiChiamata = req.body;
                const id = datiChiamata.id || Date.now().toString();
                datiChiamata.id = id;
                // Se lo stato non è specificato, allora è 'In Attesa'
                if (!datiChiamata.stato) datiChiamata.stato = 'In Attesa';
                await kv.set(`chiamata:${id}`, datiChiamata);
                return res.status(201).json(datiChiamata);

            case 'PUT':
                const chiamataAggiornata = req.body;
                if (!chiamataAggiornata.id) throw new Error('ID mancante');
                await kv.set(`chiamata:${chiamataAggiornata.id}`, chiamataAggiornata);
                return res.status(200).json(chiamataAggiornata);

            case 'DELETE':
                // TRASFORMAZIONE IN ARCHIVIAZIONE
                const { id: idArchivia } = req.query;
                if (!idArchivia) throw new Error('ID mancante');

                // Recuperiamo la chiamata esistente per non perdere i dati
                const chiamataDaArchiviare = await kv.get(`chiamata:${idArchivia}`);
                
                if (chiamataDaArchiviare) {
                    // Cambiamo solo lo stato invece di cancellare
                    chiamataDaArchiviare.stato = 'completata';
                    chiamataDaArchiviare.dataArchiviazione = new Date().toLocaleString('it-IT');
                    await kv.set(`chiamata:${idArchivia}`, chiamataDaArchiviare);
                    return res.status(200).json({ message: 'Chiamata spostata in archivio' });
                } else {
                    return res.status(404).json({ message: 'Chiamata non trovata' });
                }

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).end(`Metodo ${method} non consentito`);
        }
    } catch (error) {
        console.error('Errore API Chiamate:', error);
        return res.status(500).json({ error: error.message });
    }
}
