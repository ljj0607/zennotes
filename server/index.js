import dotenv from 'dotenv';
import express from 'express';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

dotenv.config();

const app = express();
const port = Number(process.env.API_PORT || 3001);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../data/zennotes.db');
fs.mkdirSync(path.dirname(dbPath), {recursive: true});

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Work', 'Personal', 'Ideas', 'Inspirations')),
    timestamp TEXT NOT NULL,
    date TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

const seedNotes = [
  {
    id: '1',
    title: 'Project Alpha Roadmap',
    content:
      'Review the latest wireframes and finalize the sprint backlog for Q3. Ensure the design tokens are synced with the development team...',
    category: 'Work',
    timestamp: '2h ago',
    date: '2023-11-14',
    tags: ['#work', '#roadmap'],
  },
  {
    id: '2',
    title: 'Grocery List',
    content:
      'Milk, Eggs, Organic Spinach, Whole Wheat Bread, Avocados, and those cookies Sarah mentioned last Tuesday.',
    category: 'Personal',
    timestamp: 'Yesterday, 4:30 PM',
    date: '2023-11-13',
    tags: ['#personal'],
  },
  {
    id: '3',
    title: 'Weekend Trip Ideas',
    content:
      'Looking at cabin rentals in the Blue Ridge Mountains or maybe a quick flight to Charleston for the food scene.',
    category: 'Ideas',
    timestamp: 'Oct 12, 2023',
    date: '2023-10-12',
    tags: ['#ideas', '#travel'],
  },
  {
    id: '4',
    title: 'App Design Inspiration',
    content:
      'Focus on high contrast for dark mode, subtle micro-interactions, and using SF Pro or Inter for typography. Check out Mobbin for examples.',
    category: 'Work',
    timestamp: 'Oct 10, 2023',
    date: '2023-10-10',
    tags: ['#work', '#design'],
  },
  {
    id: '5',
    title: 'Book Reading List',
    content:
      '1. Atomic Habits by James Clear 2. The Creative Act by Rick Rubin 3. Dune Messiah by Frank Herbert...',
    category: 'Personal',
    timestamp: 'Oct 05, 2023',
    date: '2023-10-05',
    tags: ['#personal', '#books'],
  },
];

const notesCount = db.prepare('SELECT COUNT(*) as count FROM notes').get().count;
if (notesCount === 0) {
  const insert = db.prepare(`
    INSERT INTO notes (id, title, content, category, timestamp, date, tags, created_at, updated_at)
    VALUES (@id, @title, @content, @category, @timestamp, @date, @tags, @created_at, @updated_at)
  `);

  const insertMany = db.transaction((items) => {
    const now = new Date().toISOString();
    for (const note of items) {
      insert.run({
        ...note,
        tags: JSON.stringify(note.tags || []),
        created_at: now,
        updated_at: now,
      });
    }
  });

  insertMany(seedNotes);
}

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

const mapNote = (row) => ({
  ...row,
  tags: row.tags ? JSON.parse(row.tags) : [],
});

app.get('/api/health', (_req, res) => {
  res.json({ok: true});
});

app.get('/api/notes', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT id, title, content, category, timestamp, date, tags
       FROM notes
       ORDER BY updated_at DESC`,
    )
    .all();
  res.json(rows.map(mapNote));
});

app.post('/api/notes', (req, res) => {
  const {id, title, content, category, timestamp, date, tags} = req.body || {};
  if (!id || !title?.trim() || !content?.trim() || !category || !timestamp || !date) {
    res.status(400).json({message: 'Invalid note payload.'});
    return;
  }

  const now = new Date().toISOString();
  try {
    db.prepare(
      `INSERT INTO notes (id, title, content, category, timestamp, date, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(id, title.trim(), content.trim(), category, timestamp, date, JSON.stringify(tags || []), now, now);
    res.status(201).json({ok: true});
  } catch {
    res.status(409).json({message: 'Note already exists.'});
  }
});

app.put('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  const {title, content, category, timestamp, date, tags} = req.body || {};

  if (!title?.trim() || !content?.trim() || !category || !timestamp || !date) {
    res.status(400).json({message: 'Invalid note payload.'});
    return;
  }

  const result = db
    .prepare(
      `UPDATE notes
       SET title = ?, content = ?, category = ?, timestamp = ?, date = ?, tags = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(title.trim(), content.trim(), category, timestamp, date, JSON.stringify(tags || []), new Date().toISOString(), noteId);

  if (result.changes === 0) {
    res.status(404).json({message: 'Note not found.'});
    return;
  }

  res.json({ok: true});
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
