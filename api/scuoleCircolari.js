import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const { method } = req;

    try {
        switch (method) {
            case 'GET':
                const lista = await kv.get('scuole_circolari_list') || [];
                return res.status(200).json(lista);

            case 'POST':
                const { nome, url } = req.body;
                if (!nome || !url) {
                    return res.status(400).json({ error: 'Nome e URL sono obbligatori' });
                }
                const listaAttuale = await kv.get('scuole_circolari_list') || [];
                const nuovaScuola = {
                    id: Date.now().toString(),
                    nome: nome.trim().toUpperCase(),
                    url: url.trim()
                };
                listaAttuale.push(nuovaScuola);
                await kv.set('scuole_circolari_list', listaAttuale);
                return res.status(201).json(nuovaScuola);

            case 'DELETE':
                const { id } = req.query;
                if (!id) return res.status(400).json({ error: 'ID mancante' });
                
                let scuole = await kv.get('scuole_circolari_list') || [];
                scuole = scuole.filter(s => String(s.id) !== String(id));
                await kv.set('scuole_circolari_list', scuole);
                return res.status(200).json({ message: 'Scuola rimossa' });

            default:
                res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
                return res.status(405).end(`Metodo ${method} non consentito`);
        }
    } catch (error) {
        console.error('Errore API scuoleCircolari:', error);
        return res.status(500).json({ error: 'Errore interno del server' });
    }
}
