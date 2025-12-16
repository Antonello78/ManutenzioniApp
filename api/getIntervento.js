// netlify/functions/getIntervento.js
const { query } = require('./db');

export default async function handler(req, res) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Metodo non consentito' }) };
    }

    const id = event.queryStringParameters.id;
    if (!id) {
        return { statusCode: 400, body: JSON.stringify({ error: 'ID Intervento mancante.' }) };
    }

    try {
        // SQL: Seleziona per ID
        const result = await query(`SELECT * FROM interventi WHERE id = $1`, [id]);
        
        if (result.rows.length === 0) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Intervento non trovato.' }) };
        }

        res.status(200).json({...});
	return;

    } catch (error) {
        console.error("Errore getIntervento:", error);
        res.status(500).json({...});
	return;
    }
};