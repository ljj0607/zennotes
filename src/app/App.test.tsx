import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import App from './App';
import {createNote, fetchNotes, updateNote} from '../api/notes';

vi.mock('motion/react', async () => {
  const ReactModule = await import('react');
  const MotionDiv = ({
    children,
    layoutId,
    initial,
    animate,
    exit,
    transition,
    ...rest
  }: {
    children?: React.ReactNode;
    layoutId?: string;
    initial?: unknown;
    animate?: unknown;
    exit?: unknown;
    transition?: unknown;
  }) => <div {...rest}>{children}</div>;

  return {
    motion: {div: MotionDiv},
    AnimatePresence: ({children}: {children?: React.ReactNode}) =>
      ReactModule.createElement(ReactModule.Fragment, null, children),
  };
});

vi.mock('../api/notes', () => ({
  fetchNotes: vi.fn(),
  createNote: vi.fn(),
  updateNote: vi.fn(),
}));

const baseNote = {
  id: 'n1',
  title: 'Loaded Note',
  content: 'Loaded content',
  category: 'Work' as const,
  timestamp: 'Now',
  date: '2026-02-25',
  tags: [],
};

describe('App', () => {
  beforeEach(() => {
    vi.mocked(fetchNotes).mockReset();
    vi.mocked(createNote).mockReset();
    vi.mocked(updateNote).mockReset();
  });

  it('loads and renders notes', async () => {
    vi.mocked(fetchNotes).mockResolvedValue([baseNote]);

    render(<App />);

    expect(screen.getByText('Loading notes...')).toBeInTheDocument();
    expect(await screen.findByText('Loaded Note')).toBeInTheDocument();
  });

  it('shows error when loading fails', async () => {
    vi.mocked(fetchNotes).mockRejectedValue(new Error('network'));

    render(<App />);

    expect(await screen.findByText('加载笔记失败，请确认后端服务已启动。')).toBeInTheDocument();
  });

  it('updates an existing note', async () => {
    vi.mocked(fetchNotes).mockResolvedValue([baseNote]);
    vi.mocked(updateNote).mockResolvedValue();
    const user = userEvent.setup();

    render(<App />);
    const noteTitle = await screen.findByText('Loaded Note');
    await user.click(noteTitle);

    const titleInput = await screen.findByPlaceholderText('Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');
    await user.click(screen.getByText('Done'));

    await waitFor(() => {
      expect(updateNote).toHaveBeenCalledWith(expect.objectContaining({id: 'n1', title: 'Updated Title'}));
    });
  });

  it('creates a new note', async () => {
    vi.mocked(fetchNotes).mockResolvedValue([]);
    vi.mocked(createNote).mockResolvedValue();
    const user = userEvent.setup();

    const {container} = render(<App />);

    await waitFor(() => {
      expect(fetchNotes).toHaveBeenCalled();
    });
    const addButton = container.querySelector('button.fixed.bottom-24.right-6');
    expect(addButton).not.toBeNull();
    if (!addButton) {
      return;
    }

    fireEvent.click(addButton);

    const titleInput = await screen.findByPlaceholderText('Title');
    const contentInput = await screen.findByPlaceholderText('Start typing your thoughts...');
    await user.type(titleInput, 'Created Title');
    await user.type(contentInput, 'Created Content');
    await user.click(screen.getByText('Done'));

    await waitFor(() => {
      expect(createNote).toHaveBeenCalledWith(
        expect.objectContaining({title: 'Created Title', content: 'Created Content'}),
      );
    });
  });
});
