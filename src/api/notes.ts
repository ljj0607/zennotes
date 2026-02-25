import {Note} from '../models/types';

const headers = {'Content-Type': 'application/json'};
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const buildApiUrl = (path: string) => `${apiBaseUrl}${path}`;

export async function fetchNotes(): Promise<Note[]> {
  const response = await fetch(buildApiUrl('/api/notes'));
  if (!response.ok) {
    throw new Error('Failed to load notes.');
  }
  return response.json();
}

export async function createNote(note: Note): Promise<void> {
  const response = await fetch(buildApiUrl('/api/notes'), {
    method: 'POST',
    headers,
    body: JSON.stringify(note),
  });
  if (!response.ok) {
    throw new Error('Failed to create note.');
  }
}

export async function updateNote(note: Note): Promise<void> {
  const response = await fetch(buildApiUrl(`/api/notes/${note.id}`), {
    method: 'PUT',
    headers,
    body: JSON.stringify(note),
  });
  if (!response.ok) {
    throw new Error('Failed to update note.');
  }
}
