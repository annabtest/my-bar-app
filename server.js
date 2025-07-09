const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// SQLite setup
const db = new sqlite3.Database(path.join(__dirname, 'tables.db'));
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    table_name TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
});

// Save or update a user's table choice
app.post('/api/assign', (req, res) => {
  const { username, table } = req.body;
  if (!username || !table) {
    return res.status(400).json({ error: 'Missing username or table' });
  }
  db.run(
    `INSERT INTO assignments (username, table_name, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(username) DO UPDATE SET table_name=excluded.table_name, updated_at=CURRENT_TIMESTAMP`,
    [username, table],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Register a new user
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }
  db.run(
    `INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`,
    [username, password],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Get all assignments (for admin)
app.get('/api/assignments', (req, res) => {
  db.all('SELECT username, table_name, updated_at FROM assignments', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get all users (for admin)
app.get('/api/users', (req, res) => {
  db.all('SELECT username, password FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 