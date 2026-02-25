export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'Work' | 'Personal' | 'Ideas' | 'Inspirations';
  timestamp: string;
  date: string; // YYYY-MM-DD
  image?: string;
  tasks?: { id: string; text: string; completed: boolean }[];
  tags?: string[];
}

export interface Folder {
  id: string;
  name: string;
  count: number;
  icon: string;
  color: string;
}

export type View = 'notes' | 'calendar' | 'folders' | 'editor';
