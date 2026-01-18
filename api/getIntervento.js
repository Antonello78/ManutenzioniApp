// File: api/getIntervento.js (Gestisce l'inserimento/POST)

import pool from './db.js';

export default async function handler(req, res) {
    // 1. Controllo del metodo: deve essere POST per inserire dati
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Solo richieste POST ammesse per l\'inserimento' });
        return;
    }

    // 2. RECUPERO DEI DATI DAL CORPO DELLA RICHIESTA (req.body Vercel)
    const data = req.body; 

    // Destrutturazione dei dati dal form
    const { nIntervento, dataIntervento, oraInizio, oraFine, nomeScuola, plessoEdificio, numOperai, flagUrgenza } = data;
    
    // Converti la flagUrgenza da booleano (true/false) in base al valore ricevuto dal form (true o undefined)
    const isUrgent = flagUrgenza === true; 

    try {
        // SQL: Esecuzione della query di inserimento (INSERT)
        const sql = `
            INSERT INTO interventi ("nIntervento", "dataIntervento", "oraInizio", "oraFine", "nomeScuola", "plessoEdificio", "numOperai", "flagUrgenza")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;

        const values = [nIntervento, dataIntervento, oraInizio, oraFine, nomeScuola, plessoEdificio, numOperai, isUrgent];

        await pool.query(sql, values);
        
        // Risposta di successo
        res.status(200).json({ message: 'Intervento registrato con successo', nIntervento: nIntervento });
        return;

    } catch (error) {
        console.error("Errore durante l'inserimento:", error);
        // Risposta di errore
        res.status(500).json({ error: `Errore durante l'inserimento nel database: ${error.message}` });
        return;
    }
}
