// /api/db.js

import { createClient } from '@vercel/kv';

// Sostituisci con le tue variabili d'ambiente di Vercel KV
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Funzione di utilità per l'archivio completo
export async function getArchivioCompleto() {
    // Recupera tutte le chiavi che iniziano con 'intervento:'
    const keys = await kv.keys('intervento:*');
    if (keys.length === 0) return [];
    
    // Recupera tutti gli interventi in una sola chiamata
    const interventi = await kv.mget(...keys);
    
    // Filtra gli interventi nulli e restituisce l'array
    return interventi.filter(i => i != null);
}

// Funzione per salvare/aggiornare un singolo intervento
export async function saveInterventoKV(intervento) {
    const key = `intervento:${intervento.nIntervento}`;
    // Imposta il valore dell'intervento con la chiave N° Intervento
    await kv.set(key, intervento);
}

// Funzione per incrementare il contatore (atomica)
export async function incrementContatoreKV(anno) {
    const key = `contatore:${anno}`;
    // Incrementa la chiave e restituisce il nuovo valore. 
    // Se la chiave non esiste, parte da 0 e restituisce 1.
    return await kv.incr(key); 
}

// Funzione per leggere l'ultimo numero (senza incrementare)
export async function getContatoreKV(anno) {
    const key = `contatore:${anno}`;
    // Restituisce il valore, o 0 se non esiste
    return await kv.get(key) || 0; 
}
