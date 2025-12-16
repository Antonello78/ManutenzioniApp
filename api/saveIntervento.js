// netlify/functions/saveIntervento.js
const { query } = require('./db');

export default async function handler(req, res) {
    const data = JSON.parse(event.body);
    const { id, nIntervento, dataIntervento, nomeScuola, plessoEdificio, oraInizio, oraFine, numOperai, flagUrgenza, tariffaOraria, totaleManodopera } = data;

    try {
        if (event.httpMethod === 'POST') {
            // CREAZIONE (POST)
            const sql = `
                INSERT INTO interventi ("nIntervento", "dataIntervento", "nomeScuola", "plessoEdificio", 
                "oraInizio", "oraFine", "numOperai", "flagUrgenza", "tariffaOraria", "totaleManodopera")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *`;
            
            const values = [nIntervento, dataIntervento, nomeScuola, plessoEdificio, oraInizio, oraFine, numOperai, flagUrgenza, tariffaOraria, totaleManodopera];

            const result = await query(sql, values);
            return {
                statusCode: 200,
                body: JSON.stringify(result.rows[0])
            };

        } else if (event.httpMethod === 'PUT' && id) {
            // AGGIORNAMENTO (PUT)
            const sql = `
                UPDATE interventi SET 
                "nIntervento" = $1, "dataIntervento" = $2, "nomeScuola" = $3, "plessoEdificio" = $4, 
                "oraInizio" = $5, "oraFine" = $6, "numOperai" = $7, "flagUrgenza" = $8, 
                "tariffaOraria" = $9, "totaleManodopera" = $10 
                WHERE id = $11
                RETURNING *`;
            
            const values = [nIntervento, dataIntervento, nomeScuola, plessoEdificio, oraInizio, oraFine, numOperai, flagUrgenza, tariffaOraria, totaleManodopera, id];

            const result = await query(sql, values);
            if (result.rows.length === 0) {
                 return { statusCode: 404, body: JSON.stringify({ error: 'Intervento non trovato per aggiornamento' }) };
            }

            res.status(200).json({...});
	    return;

        } else {
            return { statusCode: 405, body: JSON.stringify({ error: 'Metodo non consentito o ID mancante' }) };
        }
    } catch (error) {
        console.error("Errore saveIntervento:", error);
        res.status(500).json({...});
	return;
    }
};