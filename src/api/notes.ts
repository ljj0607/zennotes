import {Note} from '../models/types';

const headers = {'Content-Type': 'application/json'};

export async function fetchNotes(): Promise<Note[]> {
  const response = await fetch('/api/notes');
  if (!response.ok) {
    throw new Error('Failed to load notes.');
  }
  return response.json();
}

export async function createNote(note: Note): Promise<void> {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers,
    body: JSON.stringify(note),
  });
  if (!response.ok) {
    throw new Error('Failed to create note.');
  }
}

export async function updateNote(note: Note): Promise<void> {
  const response = await fetch(`/api/notes/${note.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(note),
  });
  if (!response.ok) {
    throw new Error('Failed to update note.');
  }
}
