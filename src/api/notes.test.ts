import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createNote, fetchNotes, updateNote} from './notes';

describe('notes api client', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetchNotes returns notes when response is ok', async () => {
    const payload = [{id: '1', title: 'N1'}];
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(payload),
    });

    const result = await fetchNotes();

    expect(fetchMock).toHaveBeenCalledWith('/api/notes');
    expect(result).toEqual(payload);
  });

  it('fetchNotes throws when response is not ok', async () => {
    fetchMock.mockResolvedValue({ok: false});
    await expect(fetchNotes()).rejects.toThrow('Failed to load notes.');
  });

  it('createNote sends post request', async () => {
    fetchMock.mockResolvedValue({ok: true});

    const note = {
      id: 'a1',
      title: 'new title',
      content: 'new content',
      category: 'Work' as const,
      timestamp: 'Just now',
      date: '2026-02-25',
      tags: ['#work'],
    };

    await createNote(note);

    expect(fetchMock).toHaveBeenCalledWith('/api/notes', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(note),
    });
  });

  it('createNote throws when request fails', async () => {
    fetchMock.mockResolvedValue({ok: false});
    await expect(
      createNote({
        id: 'a1',
        title: 'new title',
        content: 'new content',
        category: 'Work' as const,
        timestamp: 'Just now',
        date: '2026-02-25',
        tags: [],
      }),
    ).rejects.toThrow('Failed to create note.');
  });

  it('updateNote sends put request', async () => {
    fetchMock.mockResolvedValue({ok: true});

    const note = {
      id: 'u1',
      title: 'updated',
      content: 'updated content',
      category: 'Personal' as const,
      timestamp: 'Now',
      date: '2026-02-25',
      tags: ['#personal'],
    };

    await updateNote(note);

    expect(fetchMock).toHaveBeenCalledWith('/api/notes/u1', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(note),
    });
  });

  it('updateNote throws when request fails', async () => {
    fetchMock.mockResolvedValue({ok: false});
    await expect(
      updateNote({
        id: 'u1',
        title: 'updated',
        content: 'updated content',
        category: 'Personal' as const,
        timestamp: 'Now',
        date: '2026-02-25',
        tags: [],
      }),
    ).rejects.toThrow('Failed to update note.');
  });
});
