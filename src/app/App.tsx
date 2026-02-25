/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Grid, 
  Search, 
  Plus, 
  Calendar as CalendarIcon, 
  FileText, 
  Folder as FolderIcon, 
  Settings,
  ChevronLeft,
  MoreHorizontal,
  CheckCircle,
  Circle,
  Image as ImageIcon,
  Type as TypeIcon,
  CheckSquare,
  PenTool,
  Bold,
  Italic,
  List as ListIcon,
  ChevronRight,
  Clock
} from 'lucide-react';
import { createNote, fetchNotes, updateNote } from '../api/notes';
import { Note, Folder, View } from '../models/types';

// --- Components ---

const StatusHeader = () => (
  <div className="h-11 w-full bg-background-light dark:bg-background-dark sticky top-0 z-50 flex items-center justify-between px-6 shrink-0">
    <span className="text-sm font-semibold">9:41</span>
    <div className="flex items-center gap-1.5">
      <div className="w-4 h-4 flex items-center justify-center"><span className="text-[10px]">📶</span></div>
      <div className="w-4 h-4 flex items-center justify-center"><span className="text-[10px]">📶</span></div>
      <div className="w-4 h-4 flex items-center justify-center"><span className="text-[10px]">🔋</span></div>
    </div>
  </div>
);

const BottomNav = ({ currentView, setView }: { currentView: View, setView: (v: View) => void }) => {
  const navItems = [
    { id: 'calendar', label: 'Review', icon: CalendarIcon },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'folders', label: 'Folders', icon: FolderIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between z-40 pb-4">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id as View)}
          className={`flex flex-col items-center transition-colors ${
            currentView === item.id ? 'text-primary' : 'text-slate-400'
          }`}
        >
          <item.icon size={24} />
          <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
        </button>
      ))}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
    </footer>
  );
};

// --- Views ---

const NotesListView = ({ notes, onNoteClick, onAddNote }: { notes: Note[], onNoteClick: (n: Note) => void, onAddNote: () => void }) => {
  const [activeCategory, setActiveCategory] = useState('All Notes');
  const categories = ['All Notes', 'Work', 'Personal', 'Inspirations', 'Ideas'];

  const filteredNotes = useMemo(() => {
    if (activeCategory === 'All Notes') return notes;
    return notes.filter(n => n.category === activeCategory);
  }, [notes, activeCategory]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 pt-2 pb-4 bg-background-light dark:bg-background-dark sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200/50 dark:bg-primary/10 text-primary">
            <Grid size={20} />
          </button>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-200/50 dark:bg-slate-800/50 border-none rounded-xl focus:ring-2 focus:ring-primary text-sm transition-all outline-none" 
            placeholder="Search your notes..." 
            type="text"
          />
        </div>
      </header>

      <nav className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat 
                  ? 'bg-primary text-white' 
                  : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      <main className="px-6 pb-32 space-y-4 overflow-y-auto flex-1 hide-scrollbar">
        {filteredNotes.map(note => (
          <motion.div
            layoutId={note.id}
            key={note.id}
            onClick={() => onNoteClick(note)}
            className="p-4 rounded-xl bg-white dark:bg-slate-800/40 shadow-sm border border-slate-100 dark:border-slate-800/60 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{note.title}</h3>
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                note.category === 'Work' ? 'text-primary bg-primary/10' :
                note.category === 'Personal' ? 'text-emerald-500 bg-emerald-500/10' :
                'text-amber-500 bg-amber-500/10'
              }`}>
                {note.category}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
              {note.content}
            </p>
            <div className="flex items-center text-xs text-slate-400">
              <Clock size={14} className="mr-1" />
              {note.timestamp}
            </div>
          </motion.div>
        ))}
      </main>

      <button 
        onClick={onAddNote}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform z-50"
      >
        <Plus size={32} />
      </button>
    </div>
  );
};

const CalendarView = ({ notes, onNoteClick }: { notes: Note[], onNoteClick: (n: Note) => void }) => {
  const [selectedDate, setSelectedDate] = useState('2023-11-14');
  
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const calendarDays = [
    { day: 30, current: false }, { day: 31, current: false },
    { day: 1, current: true, hasNote: true }, { day: 2, current: true },
    { day: 3, current: true, hasNote: true }, { day: 4, current: true },
    { day: 5, current: true }, { day: 6, current: true },
    { day: 7, current: true, hasNote: true }, { day: 8, current: true },
    { day: 9, current: true }, { day: 10, current: true, hasNote: true },
    { day: 11, current: true }, { day: 12, current: true },
    { day: 13, current: true }, { day: 14, current: true, hasNote: true, selected: true },
    { day: 15, current: true }, { day: 16, current: true },
    { day: 17, current: true, hasNote: true }, { day: 18, current: true },
    { day: 19, current: true }
  ];

  const notesForSelectedDate = notes.filter(n => n.date === selectedDate);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">November 2023</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Today is Nov 14</p>
        </div>
        <div className="flex gap-3">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-primary/10 text-primary">
            <Search size={20} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white">
            <Plus size={24} />
          </button>
        </div>
      </header>

      <section className="px-4 pb-4">
        <div className="grid grid-cols-7 text-center mb-2">
          {days.map(d => (
            <span key={d} className="text-[10px] font-bold text-slate-400 tracking-wider">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-2 text-center">
          {calendarDays.map((d, i) => (
            <button
              key={i}
              onClick={() => d.current && setSelectedDate(`2023-11-${d.day.toString().padStart(2, '0')}`)}
              className={`h-10 flex flex-col items-center justify-center relative rounded-full transition-all ${
                d.selected ? 'bg-primary text-white shadow-lg shadow-primary/30' : 
                !d.current ? 'text-slate-300 dark:text-slate-700' : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              <span className={`text-sm ${d.selected ? 'font-bold' : 'font-medium'}`}>{d.day}</span>
              {d.hasNote && (
                <div className={`w-1 h-1 rounded-full absolute bottom-1 ${d.selected ? 'bg-white' : 'bg-primary'}`}></div>
              )}
            </button>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <div className="w-8 h-1 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        </div>
      </section>

      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-t-[2.5rem] border-t border-slate-100 dark:border-slate-800/50 flex flex-col overflow-hidden">
        <div className="px-6 pt-8 pb-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">November 14, 2023</h2>
          <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full">
            {notesForSelectedDate.length} NOTES
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-24 hide-scrollbar">
          {notesForSelectedDate.map(note => (
            <div 
              key={note.id} 
              onClick={() => onNoteClick(note)}
              className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">9:45 AM</span>
                <MoreHorizontal size={16} className="text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{note.title}</h3>
              {note.id === '1' && (
                <div className="relative h-32 w-full rounded-xl overflow-hidden my-3">
                  <img 
                    className="w-full h-full object-cover" 
                    src="https://picsum.photos/seed/arch/800/400" 
                    alt="Architecture"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {note.content}
              </p>
              <div className="flex gap-2 mt-3">
                {note.tags?.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-[10px] font-medium rounded text-slate-500 dark:text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
          
          {/* Mock Todo Card */}
          <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase">6:00 PM</span>
              <MoreHorizontal size={16} className="text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">To-do for Tomorrow</h3>
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <CheckCircle size={16} className="text-primary" />
                <span className="line-through opacity-60">Review UI components</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Circle size={16} className="text-slate-300 dark:text-slate-600" />
                <span>Draft the design documentation</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const FolderView = ({ folders }: { folders: Folder[] }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 flex justify-between items-end">
        <h1 className="text-3xl font-bold tracking-tight">Folders</h1>
        <button className="text-primary font-medium hover:opacity-80 transition-opacity">Edit</button>
      </header>

      <div className="px-6 mb-6">
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-slate-400" size={20} />
          <input 
            className="w-full bg-slate-200/50 dark:bg-slate-800/50 border-none rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 placeholder:text-slate-500 text-sm" 
            placeholder="Search folders" 
            type="text"
          />
        </div>
      </div>

      <div className="flex-1 px-6 overflow-y-auto space-y-2 pb-24 hide-scrollbar">
        {folders.map(folder => (
          <div key={folder.id} className="group flex items-center p-4 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 transition-all active:scale-[0.98]">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 bg-primary/10`}>
              <FolderIcon size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[16px]">{folder.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{folder.count} notes</p>
            </div>
            <ChevronRight size={20} className="text-slate-300 dark:text-slate-700" />
          </div>
        ))}

        <button className="w-full flex items-center p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:border-primary/50 hover:text-primary transition-all group">
          <div className="w-10 h-10 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center mr-4 group-hover:border-primary/50 group-hover:bg-primary/5">
            <Plus size={20} />
          </div>
          <span className="font-medium">Create New Folder</span>
        </button>
      </div>

      <div className="absolute bottom-20 left-0 right-0 p-6 ios-blur bg-background-light/80 dark:bg-background-dark/80 border-t border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Storage</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 w-32 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[65%]"></div>
              </div>
              <span className="text-[11px] font-medium text-slate-500">87 notes</span>
            </div>
          </div>
          <button className="bg-primary text-white p-3 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center active:scale-95 transition-transform">
            <FolderIcon size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

const NoteEditorView = ({ note, onBack, onSave }: { note: Note, onBack: () => void, onSave: (n: Note) => void }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark flex flex-col"
    >
      <StatusHeader />
      <header className="h-14 flex items-center justify-between px-4 shrink-0">
        <button onClick={onBack} className="flex items-center text-primary group transition-colors">
          <ChevronLeft size={28} />
          <span className="text-lg font-medium">Notes</span>
        </button>
        <button 
          onClick={() => onSave({ ...note, title, content })}
          className="text-primary font-semibold text-lg px-2 active:opacity-60 transition-opacity"
        >
          Done
        </button>
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar px-6 pt-4 pb-32">
        <div className="space-y-4">
          <input 
            className="w-full bg-transparent border-none p-0 text-3xl font-bold focus:ring-0 placeholder-slate-400 dark:placeholder-slate-600" 
            placeholder="Title" 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="text-sm text-slate-400 dark:text-slate-600 font-medium">
            {note.date} at {note.timestamp}
          </div>
          <div className="relative pt-2">
            <textarea 
              className="w-full bg-transparent border-none p-0 text-lg leading-relaxed focus:ring-0 placeholder-slate-400 dark:placeholder-slate-600 resize-none min-h-[400px]" 
              placeholder="Start typing your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          
          <div className="mt-4 relative group">
            <img 
              alt="Minimal workspace" 
              className="rounded-xl w-full object-cover aspect-video shadow-lg" 
              src="https://picsum.photos/seed/workspace/800/450" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-2 right-2">
              <button className="bg-black/50 text-white rounded-full p-1.5 backdrop-blur-md">
                <Plus size={16} className="rotate-45" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none">
        <div className="pointer-events-auto bg-slate-200/80 dark:bg-slate-800/80 ios-blur rounded-2xl shadow-2xl flex items-center justify-between px-2 py-1.5 border border-white/10 dark:border-slate-700/50">
          <div className="flex items-center">
            <button className="p-2.5 text-slate-600 dark:text-slate-300 active:text-primary active:bg-primary/10 rounded-lg transition-all">
              <CheckSquare size={20} />
            </button>
            <button className="p-2.5 text-slate-600 dark:text-slate-300 active:text-primary active:bg-primary/10 rounded-lg transition-all">
              <ImageIcon size={20} />
            </button>
            <button className="p-2.5 text-slate-600 dark:text-slate-300 active:text-primary active:bg-primary/10 rounded-lg transition-all">
              <PenTool size={20} />
            </button>
          </div>
          <div className="h-6 w-px bg-slate-400/20 mx-1"></div>
          <div className="flex items-center">
            <button className="p-2.5 text-slate-600 dark:text-slate-300 active:text-primary active:bg-primary/10 rounded-lg transition-all">
              <Bold size={20} />
            </button>
            <button className="p-2.5 text-slate-600 dark:text-slate-300 active:text-primary active:bg-primary/10 rounded-lg transition-all">
              <Italic size={20} />
            </button>
            <button className="p-2.5 text-slate-600 dark:text-slate-300 active:text-primary active:bg-primary/10 rounded-lg transition-all">
              <ListIcon size={20} />
            </button>
          </div>
          <div className="h-6 w-px bg-slate-400/20 mx-1"></div>
          <button className="p-2.5 text-primary active:bg-primary/10 rounded-lg transition-all">
            <TypeIcon size={20} />
          </button>
        </div>
        <div className="mt-4 flex justify-center">
          <div className="w-32 h-1 bg-slate-400/30 rounded-full"></div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<View>('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const folders = useMemo<Folder[]>(() => {
    const categoryMap: Record<string, number> = {
      Work: 0,
      Personal: 0,
      Ideas: 0,
      Inspirations: 0,
    };

    for (const note of notes) {
      categoryMap[note.category] = (categoryMap[note.category] || 0) + 1;
    }

    return [
      { id: 'work', name: 'Work', count: categoryMap.Work, icon: 'work_outline', color: 'primary' },
      { id: 'ideas', name: 'Ideas', count: categoryMap.Ideas, icon: 'lightbulb_outline', color: 'amber-500' },
      { id: 'inspirations', name: 'Inspirations', count: categoryMap.Inspirations, icon: 'star_outline', color: 'violet-500' },
      { id: 'personal', name: 'Personal', count: categoryMap.Personal, icon: 'favorite_border', color: 'rose-500' },
    ];
  }, [notes]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchNotes();
        if (!cancelled) {
          setNotes(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('加载笔记失败，请确认后端服务已启动。');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleNoteClick = (note: Note) => {
    setEditingNote(note);
    setView('editor');
  };

  const handleAddNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      category: 'Personal',
      timestamp: 'Just now',
      date: new Date().toISOString().split('T')[0],
      tags: []
    };
    setEditingNote(newNote);
    setView('editor');
  };

  const handleSaveNote = async (updatedNote: Note) => {
    const normalizedNote: Note = {
      ...updatedNote,
      title: updatedNote.title.trim(),
      content: updatedNote.content.trim(),
      timestamp: updatedNote.timestamp || 'Just now',
      tags: updatedNote.tags || [],
    };

    if (!normalizedNote.title || !normalizedNote.content) {
      setError('标题和内容不能为空。');
      return;
    }

    try {
      const exists = notes.some((n) => n.id === normalizedNote.id);
      if (exists) {
        await updateNote(normalizedNote);
        setNotes((prev) => prev.map((n) => (n.id === normalizedNote.id ? normalizedNote : n)));
      } else {
        await createNote(normalizedNote);
        setNotes((prev) => [normalizedNote, ...prev]);
      }
      setError(null);
      setEditingNote(null);
      setView('notes');
    } catch {
      setError('保存失败，请稍后重试。');
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background-light dark:bg-background-dark overflow-hidden max-w-[430px] mx-auto shadow-2xl relative">
      <StatusHeader />
      {error && (
        <div className="px-6 py-2 text-xs text-rose-600 bg-rose-50 border-b border-rose-200">
          {error}
        </div>
      )}
      
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {view === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">Loading notes...</div>
              ) : (
                <NotesListView notes={notes} onNoteClick={handleNoteClick} onAddNote={handleAddNote} />
              )}
            </motion.div>
          )}
          
          {view === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <CalendarView notes={notes} onNoteClick={handleNoteClick} />
            </motion.div>
          )}

          {view === 'folders' && (
            <motion.div
              key="folders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <FolderView folders={folders} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {view === 'editor' && editingNote && (
            <NoteEditorView 
              note={editingNote} 
              onBack={() => { setEditingNote(null); setView('notes'); }} 
              onSave={handleSaveNote}
            />
          )}
        </AnimatePresence>
      </div>

      {view !== 'editor' && <BottomNav currentView={view} setView={setView} />}
    </div>
  );
}
