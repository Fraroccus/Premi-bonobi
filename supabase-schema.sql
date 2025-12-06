-- Tabella per lo stato delle votazioni
CREATE TABLE voting_status (
  id SERIAL PRIMARY KEY,
  voting_open BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserisci uno stato iniziale
INSERT INTO voting_status (voting_open) VALUES (true);

-- Tabella per i voti
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL,
  votes JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_votes_nickname ON votes(nickname);
CREATE INDEX idx_votes_created_at ON votes(created_at);

-- RLS (Row Level Security) - abilita lettura/scrittura pubblica per semplicità
ALTER TABLE voting_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON voting_status FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON voting_status FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON votes FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON votes FOR INSERT WITH CHECK (true);
