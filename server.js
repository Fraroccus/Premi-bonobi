const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// File per salvare i dati
const DATA_FILE = 'votes.json';
const CONFIG_FILE = 'config.json';

// Inizializza i dati
let votingData = {
  votingOpen: true,
  voters: [],
  votes: []
};

// Carica i dati esistenti
if (fs.existsSync(DATA_FILE)) {
  try {
    votingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (error) {
    console.log('Inizializzazione nuovi dati di votazione');
  }
}

// Salva i dati
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(votingData, null, 2));
}

// API: Ottieni configurazione categorie
app.get('/api/config', (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Configurazione non trovata' });
  }
});

// API: Verifica stato votazioni
app.get('/api/status', (req, res) => {
  res.json({ 
    votingOpen: votingData.votingOpen,
    totalVoters: votingData.voters.length
  });
});

// API: Registra nickname
app.post('/api/register', (req, res) => {
  const { nickname } = req.body;
  
  if (!nickname || nickname.trim() === '') {
    return res.status(400).json({ error: 'Nickname non valido' });
  }

  if (!votingData.votingOpen) {
    return res.status(403).json({ error: 'Le votazioni sono chiuse' });
  }

  if (votingData.voters.includes(nickname)) {
    return res.status(400).json({ error: 'Nickname già utilizzato' });
  }

  const hasVoted = votingData.votes.some(vote => vote.nickname === nickname);
  if (hasVoted) {
    return res.status(400).json({ error: 'Hai già votato' });
  }

  res.json({ success: true, nickname });
});

// API: Invia voto
app.post('/api/vote', (req, res) => {
  const { nickname, votes } = req.body;

  if (!votingData.votingOpen) {
    return res.status(403).json({ error: 'Le votazioni sono chiuse' });
  }

  if (!nickname || !votes) {
    return res.status(400).json({ error: 'Dati non validi' });
  }

  const hasVoted = votingData.votes.some(vote => vote.nickname === nickname);
  if (hasVoted) {
    return res.status(400).json({ error: 'Hai già votato' });
  }

  votingData.voters.push(nickname);
  votingData.votes.push({
    nickname,
    votes,
    timestamp: new Date().toISOString()
  });

  saveData();
  res.json({ success: true });
});

// API: Ottieni risultati (solo se votazioni chiuse o admin)
app.get('/api/results', (req, res) => {
  if (votingData.votingOpen) {
    return res.status(403).json({ error: 'Le votazioni sono ancora aperte' });
  }

  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    const results = calculateResults(config.categories, votingData.votes);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel calcolo dei risultati' });
  }
});

// API Admin: Chiudi/Apri votazioni
app.post('/api/admin/toggle-voting', (req, res) => {
  votingData.votingOpen = !votingData.votingOpen;
  saveData();
  res.json({ votingOpen: votingData.votingOpen });
});

// API Admin: Reset votazioni
app.post('/api/admin/reset', (req, res) => {
  votingData = {
    votingOpen: true,
    voters: [],
    votes: []
  };
  saveData();
  res.json({ success: true });
});

// Calcola i risultati
function calculateResults(categories, votes) {
  const results = {};

  categories.forEach(category => {
    const categoryId = category.id;
    const scores = {};

    // Inizializza i punteggi
    category.nominations.forEach(nom => {
      scores[nom.id] = 0;
    });

    // Calcola i punteggi
    votes.forEach(vote => {
      const categoryVote = vote.votes[categoryId];
      if (categoryVote) {
        if (categoryVote.first) scores[categoryVote.first] += 4;
        if (categoryVote.second) scores[categoryVote.second] += 2;
        if (categoryVote.third) scores[categoryVote.third] += 1;
      }
    });

    // Crea classifica ordinata
    const ranking = Object.entries(scores)
      .map(([nominationId, score]) => {
        const nomination = category.nominations.find(n => n.id === nominationId);
        return {
          id: nominationId,
          name: nomination.name,
          image: nomination.image,
          score
        };
      })
      .sort((a, b) => b.score - a.score);

    results[categoryId] = {
      categoryName: category.name,
      ranking
    };
  });

  return results;
}

// Avvia server
app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
