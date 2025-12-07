const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  // Abilita CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // Carica config
      const configPath = path.join(process.cwd(), 'config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      // Ottieni tutti i voti con nickname
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('nickname, votes, created_at')
        .order('created_at', { ascending: true });

      if (votesError) throw votesError;

      // Formatta i dati con i nomi delle categorie e nomination
      const formattedVotes = votesData.map(vote => {
        const formattedCategories = {};
        
        config.categories.forEach(category => {
          const categoryVote = vote.votes[category.id];
          if (categoryVote) {
            formattedCategories[category.id] = {
              categoryName: category.name,
              selections: {
                first: category.nominations.find(n => n.id === categoryVote.first)?.name || 'N/A',
                second: category.nominations.find(n => n.id === categoryVote.second)?.name || 'N/A',
                third: category.nominations.find(n => n.id === categoryVote.third)?.name || 'N/A'
              }
            };
          }
        });

        return {
          nickname: vote.nickname,
          categories: formattedCategories,
          timestamp: vote.created_at
        };
      });

      res.status(200).json(formattedVotes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
