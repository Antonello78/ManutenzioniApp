// netlify/functions/deleteIntervento.js
const { query } = require('./db');

export default async function handler(req, res) {
    if (event.httpMethod !== 'DELETE') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Metodo non consentito' }) };
    }

    const id = event.queryStringParameters.id;
    if (!id) {
        return { statusCode: 400, body: JSON.stringify({ error: 'ID Intervento mancante.' }) };
    }

    try {
        // SQL: Ottieni prima l'intervento (per il messaggio di successo) e poi lo cancella
        const getResult = await query(`SELECT "nIntervento" FROM interventi WHERE id = $1`, [id]);
        
        if (getResult.rows.length === 0) {
             return { statusCode: 404, body: JSON.stringify({ error: 'Intervento già cancellato o non trovato.' }) };
        }
        
        const nInterventoCancellato = getResult.rows[0].nIntervento;
        
        await query(`DELETE FROM interventi WHERE id = $1`, [id]);
        
        res.status(200).json({...});
	return;

    } catch (error) {
        console.error("Errore deleteIntervento:", error);
        res.status(500).json({...});
	return;
    }
};