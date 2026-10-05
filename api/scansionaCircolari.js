import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Usa POST per avviare la ricerca.' });
    }

    try {
        const scuole = await kv.get('scuole_circolari_list') || [];
        if (scuole.length === 0) {
            return res.status(200).json({ dateTrovate: [], message: 'Nessuna scuola configurata.' });
        }

        const paroleChiave = [
            'assemblea', 'sospensione', 'ponte', 'chiusura', 'seggio', 
            'elettorale', 'ordinanza', 'festivita', 'festività', 'adattamento calendario',
            'sciopero', 'disinfestazione'
        ];

        let risultatiTotali = [];

        for (const scuola of scuole) {
            try {
                const response = await fetch(scuola.url, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                });
                
                if (!response.ok) continue;
                
                const htmlText = await response.text();
                
                // Estrazione semplice dei blocchi di testo / link contenenti notizie
                const regexTag = /<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
                let match;
                
                while ((match = regexTag.exec(htmlText)) !== null) {
                    const link = match[1];
                    const testoIncolore = match[2].replace(/<[^>]+>/g, '').trim();
                    const testoLower = testoIncolore.toLowerCase();

                    if (testoIncolore.length < 5) continue;

                    const trovata = paroleChiave.some(kw => testoLower.includes(kw));
                    if (trovata) {
                        // Verifica se contiene un riferimento temporale/data
                        risultatiTotali.push({
                            scuola: scuola.nome,
                            titolo: testoIncolore,
                            link: link.startsWith('http') ? link : new URL(link, scuola.url).href
                        });
                    }
                }
            } catch (errScuola) {
                console.error(`Errore durante la scansione di ${scuola.nome}:`, errScuola);
            }
        }

        // Rimuove duplicati per lo stesso titolo e scuola
        const risultatiUnici = risultatiTotali.filter((item, index, self) =>
            index === self.findIndex((t) => t.scuola === item.scuola && t.titolo === item.titolo)
        );

        return res.status(200).json({ dateTrovate: risultatiUnici });

    } catch (error) {
        console.error('Errore durante la ricerca circolari:', error);
        return res.status(500).json({ message: 'Errore interno nel processo di verifica.' });
    }
}
