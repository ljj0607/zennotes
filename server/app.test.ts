/** @vitest-environment node */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {createApp} from './app.js';

describe('notes api', () => {
  let tempDir = '';
  let app;
  let closeDb;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zennotes-test-'));
    const dbPath = path.join(tempDir, 'test.db');
    const instance = createApp({dbPath, seed: false});
    app = instance.app;
    closeDb = instance.close;
  });

  afterEach(() => {
    closeDb();
    fs.rmSync(tempDir, {recursive: true, force: true});
  });

  it('GET /api/health returns ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ok: true});
  });

  it('GET /api/notes returns an array', async () => {
    const response = await request(app).get('/api/notes');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(0);
  });

  it('POST /api/notes creates note', async () => {
    const note = {
      id: 'n1',
      title: 'new note',
      content: 'new content',
      category: 'Work',
      timestamp: 'Now',
      date: '2026-02-25',
      tags: ['#work'],
    };

    const response = await request(app).post('/api/notes').send(note);
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ok: true});
  });

  it('POST /api/notes returns 409 for duplicate id', async () => {
    const note = {
      id: 'n1',
      title: 'new note',
      content: 'new content',
      category: 'Work',
      timestamp: 'Now',
      date: '2026-02-25',
      tags: ['#work'],
    };

    await request(app).post('/api/notes').send(note);
    const duplicate = await request(app).post('/api/notes').send(note);
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.message).toBe('Note already exists.');
  });

  it('PUT /api/notes/:id updates existing note', async () => {
    const note = {
      id: 'n2',
      title: 'before',
      content: 'before',
      category: 'Personal',
      timestamp: 'Now',
      date: '2026-02-25',
      tags: [],
    };
    await request(app).post('/api/notes').send(note);

    const updated = {
      ...note,
      title: 'after',
      content: 'after',
    };

    const response = await request(app).put('/api/notes/n2').send(updated);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ok: true});

    const list = await request(app).get('/api/notes');
    expect(list.body[0].title).toBe('after');
  });

  it('PUT /api/notes/:id returns 404 when note not found', async () => {
    const response = await request(app).put('/api/notes/not-found').send({
      title: 'x',
      content: 'y',
      category: 'Work',
      timestamp: 'Now',
      date: '2026-02-25',
      tags: [],
    });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Note not found.');
  });
});
