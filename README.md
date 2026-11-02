# 🏗️ Gestione Manodopera Scuole - v1.6.0

**Proprietà:** Ditta D'Angelo Antonello  
**Release:** 2026  
**Tecnologia:** Cloud-Sync (Database su Vercel KV) / HTML5 / Tailwind CSS

---

## 📝 Descrizione
Questa applicazione è uno strumento professionale per la gestione dei preventivi, dei rapporti di manutenzione e della contabilità di cantiere presso le scuole statali. Grazie alla sincronizzazione cloud, i dati sono salvati su un **server centralizzato**, permettendo la consultazione e la modifica degli interventi in tempo reale da qualsiasi dispositivo (PC, smartphone o tablet).

---

## 🚀 Funzionalità Principali

### 1. Calcolo Manodopera & Interventi
* **Calcolo Automatico:** Gestione dinamica dei costi di uscita (con prima ora inclusa), tariffe orarie e maggiorazioni per urgenze o lavoro fuori orario[cite: 2].
* **Gestione Prosieguo:** Opzione per interventi continuativi o dei giorni successivi con azzeramento del diritto di chiamata[cite: 2].
* **Anteprima e Stampa Report:** Generazione di un riepilogo pulito ed essenziale pronto per la stampa o l'esportazione in PDF[cite: 2].
* **Invio Email Rapido:** Trasmissione automatica del rapporto dettagliato ai referenti scolastici (DSGA)[cite: 2, 15].

### 2. Archivio & Controllo Amministrativo
* **Stato Amministrativo Avanzato:** Tracciamento rapido per ogni intervento di:
  * Scansione PDF caricata su Google Drive (`Scan.`)[cite: 2]
  * Email di riscontro inviata (`Mail`)[cite: 2]
  * Preventivo emesso con numero e data (`Prev.`)[cite: 2]
  * Fattura emessa con numero e data (`Fatt.`)[cite: 2]
  * **Saldo OK:** Controllo definitivo dell'avvenuto pagamento[cite: 2].
* **Blocco di Sicurezza:** Una volta spuntato il "SALDO OK", i campi amministrativi associati (`Prev.` e `Fatt.`) vengono bloccati automaticamente per prevenire modifiche accidentali.
* **Filtri e Ricerca:** Ricerca testuale fluida e filtri per tipologia (Urgenze, Prosieguo), mesi, anni e stato amministrativo[cite: 2].
* **Esportazione Dati:** Funzione di export dell'archivio in formato Excel (CSV)[cite: 2].

### 3. Listino Prezzi & Materiali
* **Gestione Materiali:** Catalogo interno dei ricambi con calcolo automatico del prezzo di vendita basato su percentuali di ricarico personalizzabili[cite: 2].
* **Selezione Rapida:** Inserimento diretto dei materiali dal listino all'interno del modulo d'intervento[cite: 2].

### 4. Registro Chiamate & Utilità
* **Chiamate in Attesa:** Gestione delle segnalazioni urgenti dalle scuole con assegnazione di priorità[cite: 2].
* **Lista della Spesa:** Riepilogo aggregato dei materiali da acquistare per i vari cantieri[cite: 2].
* **Integrazione Google Calendar:** Sincronizzazione rapida degli appuntamenti di manutenzione[cite: 2].

---

## 📖 Guida Rapida all'Uso
* **Nuovo Intervento:** Clicca sul tasto azzurro **"Nuovo"** per pulire i campi e assegnare automaticamente il progressivo ufficiale dell'anno[cite: 2].
* **Consultazione:** Seleziona un lavoro dall'archivio; i campi si apriranno in modalità protetta (sola lettura) per evitare modifiche involontarie[cite: 2].
* **Modifica:** Clicca sul tasto arancione **"Modifica"** per sbloccare i dati di un intervento esistente e aggiornarli[cite: 2].

---
*Ditta D'Angelo Antonello — v1.6.0 (Release 2026)*
