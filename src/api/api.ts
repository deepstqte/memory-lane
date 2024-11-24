import express, { Express, Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const app: Express = express();
const port = 4001;
const db = new sqlite3.Database('memories.db');

app.use(cors());
app.use(express.json());

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      timestamp DATE
    )
  `);
});

interface Memory {
  id?: number;
  name: string;
  description: string;
  timestamp: string;
}

// Get all memories
app.get('/memories', (req: Request, res: Response) => {
  db.all('SELECT * FROM memories', (err, rows: Memory[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ memories: rows });
  });
});

// Create a new memory
app.post('/memories', (req: Request, res: Response) => {
  const { name, description, timestamp } = req.body as Memory;

  if (!name || !description || !timestamp) {
    res.status(400).json({
      error: 'Please provide all fields: name, description, timestamp',
    });
    return;
  }

  const stmt = db.prepare(
    'INSERT INTO memories (name, description, timestamp) VALUES (?, ?, ?)'
  );
  stmt.run(name, description, timestamp, (err: Error | null) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ message: 'Memory created successfully' });
  });
});

// Get a memory by ID
app.get('/memories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.get('SELECT * FROM memories WHERE id = ?', [id], (err, row: Memory | undefined) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }
    res.json({ memory: row });
  });
});

// Update a memory by ID
app.put('/memories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, timestamp } = req.body as Memory;

  if (!name || !description || !timestamp) {
    res.status(400).json({
      error: 'Please provide all fields: name, description, timestamp',
    });
    return;
  }

  const stmt = db.prepare(
    'UPDATE memories SET name = ?, description = ?, timestamp = ? WHERE id = ?'
  );
  stmt.run(name, description, timestamp, id, (err: Error | null) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Memory updated successfully' });
  });
});

// Delete a memory by ID
app.delete('/memories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.run('DELETE FROM memories WHERE id = ?', [id], (err: Error | null) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Memory deleted successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
