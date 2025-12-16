// netlify/functions/getArchivio.js
const { query } = require('./db');

export default async function handler(req, res) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Metodo non consentito' }) };
    }

    try {
        // SQL: Seleziona tutti i campi, ordinati per l'ID (che è sequenziale)
        const result = await query(`SELECT * FROM interventi ORDER BY id DESC`);
        
        res.status(200).json({...});
	return;

    } catch (error) {
        console.error("Errore getArchivio:", error);
        res.status(500).json({...});
	return;
    }
};