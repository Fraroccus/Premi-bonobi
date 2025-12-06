# Sistema Votazione Premi - Deployment su Vercel

## 📦 Setup Locale

```bash
npm install
npm start
```

Il sito sarà disponibile su http://localhost:3001

## 🚀 Deploy su Vercel

### 1. Setup Database Supabase

Esegui lo script SQL in `supabase-schema.sql` nel SQL Editor di Supabase per creare le tabelle.

### 2. Push su GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/Fraroccus/Premi-bonobi.git
git push -u origin main
```

### 3. Deploy su Vercel

1. Vai su [vercel.com](https://vercel.com)
2. Importa il repository GitHub
3. Configura le variabili d'ambiente:
   - `SUPABASE_URL`: Il tuo Supabase Project URL
   - `SUPABASE_ANON_KEY`: La tua Supabase anon/public key
4. Clicca "Deploy"

## 🎯 Struttura Progetto

```
Premi/
├── api/                    # Vercel Serverless Functions
│   ├── config.js          # GET configurazione
│   ├── status.js          # GET stato votazioni
│   ├── register.js        # POST registrazione nickname
│   ├── vote.js            # POST invio voto
│   ├── results.js         # GET risultati
│   └── admin/
│       ├── toggle-voting.js  # POST chiudi/apri votazioni
│       └── reset.js          # POST reset votazioni
├── public/                # File statici
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── images/            # Immagini nomination
├── config.json            # Categorie e nomination
├── vercel.json            # Configurazione Vercel
└── supabase-schema.sql    # Schema database
```

## 📝 Configurazione

### Categorie e Nomination

Modifica `config.json` per cambiare le categorie e i candidati.

### Immagini

Carica le immagini dei candidati in `public/images/` e assicurati che i percorsi nel `config.json` siano corretti.

## 🎮 Utilizzo

### Votanti
- Accedi al sito
- Inserisci un nickname
- Vota per ogni categoria

### Admin
- Premi `Ctrl + Shift + A` per accedere al pannello admin
- Chiudi le votazioni
- Visualizza la presentazione risultati

## 🔒 Database Supabase

Le tabelle create:
- `voting_status`: Stato votazioni (aperte/chiuse)
- `votes`: Voti degli utenti
