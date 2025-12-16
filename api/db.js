// netlify/functions/db.js
const { Pool } = require('pg');

// La Connection String viene letta dalla variabile d'ambiente di Netlify
// (quella che hai chiamato DATABASE_URL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

/**
 * Esegue una query sul database.
 * @param {string} text - La stringa SQL.
 * @param {Array<any>} params - I parametri per evitare SQL injection.
 */
async function query(text, params) {
    return pool.query(text, params);
}

module.exports = {
    query,
};