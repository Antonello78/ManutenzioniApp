// File: api/getNextNumber.js

// Usa la sintassi 'import' e importa 'pool'
import pool from './db.js';

export default async function handler(req, res) {
    // VERCEL: Il controllo del metodo usa 'req' e 'res'
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Metodo non consentito' });
        return;
    }

    const CURRENT_YEAR = new Date().getFullYear().toString().substring(2);

    try {
        // SQL: Trova il numero sequenziale più alto
        const result = await pool.query( // Usiamo pool.query e non solo query
            `SELECT MAX(CAST(SUBSTRING("nIntervento" FROM 1 FOR 3) AS INTEGER))
             AS max_number FROM interventi
             WHERE "nIntervento" LIKE $1 || '/%'`,
            [CURRENT_YEAR]
        );

        // Il numero di partenza per l'anno 25 era 74.
        const INIZIO_NUOVO_ANNO = 0; // Se non è 2025, ripartiamo da 0
        const INIZIO_2025 = 74;
        
        let ultimoNumero = 0;
        
        if (result.rows.length > 0 && result.rows[0].max_number !== null) {
            ultimoNumero = result.rows[0].max_number;
        } else if (CURRENT_YEAR === '25') {
            // Se non ci sono interventi e siamo nel 2025 (il tuo anno di partenza)
            ultimoNumero = INIZIO_2025;
        } else {
             // Se è un nuovo anno diverso da 2025, ripartiamo da 0 (o dal numero desiderato)
             ultimoNumero = INIZIO_NUOVO_ANNO;
        }
        
        const prossimoNumero = ultimoNumero + 1;

        // Formattazione del numero (es. 075/25)
        const nextNumberString = prossimoNumero.toString().padStart(3, '0') + '/' + CURRENT_YEAR;

        res.status(200).json({ nIntervento: nextNumberString });
        return;

    } catch (error) {
        console.error("Errore getNextNumber:", error);
        res.status(500).json({ error: `Errore server: ${error.message}` });
        return;
    }
}
