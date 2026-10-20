import { describe, expect, it } from 'vitest';
import { addGoalProgress, dashboardStats, deleteNote, deleteTask, filterNotes, filterTasks, secondsRemaining, toggleHabit, toggleTask, upsertNote, type Goal, type Note, type Task } from '../lib/productivity';

const tasks: Task[] = [
  { id: '1', title: 'Review roadmap', done: false, priority: 'High', due: 'Today', list: 'Work' },
  { id: '2', title: 'Read a chapter', done: true, priority: 'Low', due: 'Today', list: 'Personal' },
];
const notes: Note[] = [{ id: 'n1', title: 'Idea', body: 'A calmer home screen', tag: 'Product', date: 'Today', pinned: false }];
const goals: Goal[] = [{ id: 'g1', title: 'Learn', detail: '', progress: 98, date: 'Dec 1' }];

describe('tasks', () => {
  it('filters by title, list, and priority, case-insensitively', () => {
    expect(filterTasks(tasks, 'ROAD')).toHaveLength(1);
    expect(filterTasks(tasks, 'personal')[0].id).toBe('2');
    expect(filterTasks(tasks, 'high')[0].id).toBe('1');
    expect(filterTasks(tasks, '   ')).toEqual(tasks);
  });
  it('toggles completion and deletes only the chosen task', () => {
    expect(toggleTask(tasks, '1')[0].done).toBe(true);
    expect(toggleTask(tasks, 'missing')).toEqual(tasks);
    expect(deleteTask(tasks, '2').map(t => t.id)).toEqual(['1']);
  });
  it('calculates zero-safe completion and outstanding priority stats', () => {
    expect(dashboardStats(tasks, goals)).toMatchObject({ complete: 1, total: 2, percent: 50, highPriority: 1, goalProgress: 98 });
    expect(dashboardStats([], [])).toMatchObject({ percent: 0, goalProgress: 0 });
  });
});
describe('notes and goals', () => {
  it('searches note title, body, and tag', () => {
    expect(filterNotes(notes, 'home')).toEqual(notes);
    expect(filterNotes(notes, 'PRODUCT')).toEqual(notes);
    expect(filterNotes(notes, 'missing')).toEqual([]);
  });
  it('creates and updates a note without duplicating it, then deletes it', () => {
    const revised = { ...notes[0], title: 'Updated' };
    expect(upsertNote(notes, revised)).toEqual([revised]);
    const created = { ...revised, id: 'n2' };
    expect(upsertNote(notes, created)).toEqual([created, ...notes]);
    expect(deleteNote(notes, 'n1')).toEqual([]);
  });
  it('clamps goal progress at 100 and toggles habit completion', () => {
    expect(addGoalProgress(goals, 'g1')[0].progress).toBe(100);
    expect(addGoalProgress(goals, 'missing')).toEqual(goals);
    expect(toggleHabit([], 'Read')).toEqual(['Read']);
    expect(toggleHabit(['Read'], 'Read')).toEqual([]);
  });
});
describe('focus timer', () => {
  it('reconstructs time after refresh, pauses, and never goes negative', () => {
    expect(secondsRemaining(1000, 25, 11000)).toBe(1490);
    expect(secondsRemaining(null, 25, 5000)).toBe(1500);
    expect(secondsRemaining(null,25,5000,420)).toBe(420);
    expect(secondsRemaining(5000,25,15000,420)).toBe(410);
    expect(secondsRemaining(1000, 1, 121000)).toBe(0);
  });
});
