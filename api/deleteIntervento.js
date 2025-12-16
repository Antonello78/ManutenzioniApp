// /api/deleteIntervento.js

import { kv } from '@vercel/kv'; // Importiamo direttamente kv per la funzione di delete

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Metodo non consentito. Usa DELETE.' });
    }

    // Ci aspettiamo che il N° Intervento sia passato come parametro di query
    const { nIntervento } = req.query; 

    if (!nIntervento) {
        return res.status(400).json({ message: 'N° Intervento (nIntervento) mancante nei parametri di query.' });
    }
    
    // Formattiamo la chiave esattamente come viene salvata in saveIntervento.js
    const keyToDelete = `intervento:${nIntervento}`; 

    try {
        // 1. Eliminazione dal database KV
        // kv.del è una funzione atomica che elimina la chiave specificata
        await kv.del(keyToDelete); 
        
        return res.status(200).json({ 
            message: `Intervento N° ${nIntervento} eliminato con successo.`,
            deletedKey: keyToDelete
        });

    } catch (error) {
        console.error('Errore durante l\'eliminazione:', error);
        return res.status(500).json({ 
            message: 'Errore interno del server durante l\'eliminazione DB.', 
            error: error.message 
        });
    }
}
