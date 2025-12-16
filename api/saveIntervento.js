// /api/saveIntervento.js

import { saveInterventoKV, incrementContatoreKV } from './db.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Metodo non consentito.' });
    }

    try {
        const { datiIntervento, anno, isUpdate } = req.body;
        
        if (!isUpdate) {
            // Se è un NUOVO INSERIMENTO: 
            // 1. Incrementa il contatore in modo atomico (nessun rischio di duplicati)
            const nuovoContatore = await incrementContatoreKV(anno);
            
            // 2. Salva il dato completo
            await saveInterventoKV(datiIntervento);
            
            return res.status(201).json({ 
                message: 'Nuovo intervento salvato con successo e contatore aggiornato.',
                nuovoNumero: nuovoContatore
            });
            
        } else {
            // Se è un AGGIORNAMENTO:
            await saveInterventoKV(datiIntervento); 
            // Nessun incremento del contatore
            return res.status(200).json({ message: 'Intervento aggiornato con successo.' });
        }

    } catch (error) {
        console.error('Errore nel salvataggio:', error);
        return res.status(500).json({ 
            message: 'Errore interno del server durante il salvataggio.', 
            error: error.message 
        });
    }
}

