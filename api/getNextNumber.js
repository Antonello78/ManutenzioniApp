// netlify/functions/getNextNumber.js
const { query } = require('./db');

export default async function handler(req, res) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Metodo non consentito' }) };
    }

    const CURRENT_YEAR = new Date().getFullYear().toString().substring(2);
    // Nota: Il tuo codice front-end si aspetta solo l'anno corrente (es. 25)

    try {
        // SQL: Trova il numero sequenziale più alto (es. '075') dall'ultimo N° Intervento salvato nell'anno corrente
        const result = await query(
            `SELECT MAX(CAST(SUBSTRING("nIntervento" FROM 1 FOR 3) AS INTEGER)) 
             AS max_number FROM interventi 
             WHERE "nIntervento" LIKE $1 || '/%'`,
            [CURRENT_YEAR]
        );

        // Il numero di partenza per il 2025 era 74. Lo consideriamo solo se non ci sono dati.
        const INIZIO_2025 = 74;
        
        let ultimoNumero = 0;
        if (result.rows.length > 0 && result.rows[0].max_number !== null) {
            ultimoNumero = result.rows[0].max_number;
        } else if (CURRENT_YEAR === '25') {
            // Se non ci sono interventi e siamo nel 2025, partiamo da 74
            ultimoNumero = INIZIO_2025;
        }
        
        const prossimoNumero = ultimoNumero + 1;

        res.status(200).json({ nIntervento: nextNumberString });
	return;

    } catch (error) {
        console.error("Errore getNextNumber:", error);
        res.status(500).json({ error: 'Errore server...' });
	return;
    }
};