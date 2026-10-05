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

        const mesi = {
            'gennaio': 0, 'febbraio': 1, 'marzo': 2, 'aprile': 3, 'maggio': 4, 'giugno': 5,
            'luglio': 6, 'agosto': 7, 'settembre': 8, 'ottobre': 9, 'novembre': 10, 'dicembre': 11
        };

        const oggi = new Date();
        // Limite retroattivo: massimo 15 giorni fa
        const dataLimitePassato = new Date();
        dataLimitePassato.setDate(oggi.getDate() - 15);

        let risultatiTotali = [];

        for (const scuola of scuole) {
            try {
                const response = await fetch(scuola.url, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                });
                
                if (!response.ok) continue;
                
                const htmlText = await response.text();
                
                const regexTag = /<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
                let match;
                let indiceRisultato = 0;
                
                while ((match = regexTag.exec(htmlText)) !== null) {
                    const link = match[1];
                    const testoIncolore = match[2].replace(/<[^>]+>/g, '').trim();
                    const testoLower = testoIncolore.toLowerCase();

                    if (testoIncolore.length < 5) continue;

                    const trovata = paroleChiave.some(kw => testoLower.includes(kw));
                    if (trovata) {
                        indiceRisultato++;
                        let dataCircolare = null;

                        // 1. Cerca data numerica (es. 15/10/2026, 15-10-26, 15.10.2026)
                        const matchDataNum = testoLower.match(/(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/);
                        if (matchDataNum) {
                            let giorno = parseInt(matchDataNum[1], 10);
                            let mese = parseInt(matchDataNum[2], 10) - 1;
                            let anno = parseInt(matchDataNum[3], 10);
                            if (anno < 100) anno += 2000;
                            dataCircolare = new Date(anno, mese, giorno);
                        } 
                        // 2. Cerca data in lettere (es. 15 ottobre 2026 oppure 15 ottobre)
                        else {
                            for (const [nomeMese, numMese] of Object.entries(mesi)) {
                                if (testoLower.includes(nomeMese)) {
                                    const matchGiorno = testoLower.match(new RegExp(`(\\d{1,2})\\s+${nomeMese}`));
                                    if (matchGiorno) {
                                        let giorno = parseInt(matchGiorno[1], 10);
                                        let annoCorrente = oggi.getFullYear();
                                        dataCircolare = new Date(annoCorrente, numMese, giorno);
                                    }
                                    break;
                                }
                            }
                        }

                        // 3. Verifica della data o della posizione nella pagina
                        let daIncludere = false;

                        if (dataCircolare && !isNaN(dataCircolare.getTime())) {
                            // Includi se la data è futura oppure non più vecchia di 15 giorni
                            if (dataCircolare >= dataLimitePassato) {
                                daIncludere = true;
                            }
                        } else {
                            // Se la data non è estratta, includi solo se si trova tra i primi 5 risultati recenti della pagina
                            if (indiceRisultato <= 5) {
                                daIncludere = true;
                            }
                        }

                        if (daIncludere) {
                            risultatiTotali.push({
                                scuola: scuola.nome,
                                titolo: testoIncolore,
                                link: link.startsWith('http') ? link : new URL(link, scuola.url).href
                            });
                        }
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
