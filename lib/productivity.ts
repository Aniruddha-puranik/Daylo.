export type Task = { id: string; title: string; done: boolean; priority: 'High' | 'Medium' | 'Low'; due: string; list: string };
export type Note = { id: string; title: string; body: string; tag: string; date: string; pinned: boolean };
export type Goal = { id: string; title: string; detail: string; progress: number; date: string; priority?: 'High' | 'Medium' | 'Low' };

export function filterTasks(tasks: Task[], query: string) {
  const q = query.trim().toLocaleLowerCase();
  return q ? tasks.filter(task => `${task.title} ${task.list} ${task.priority}`.toLocaleLowerCase().includes(q)) : tasks;
}
export function filterNotes(notes: Note[], query: string) {
  const q = query.trim().toLocaleLowerCase();
  return q ? notes.filter(note => `${note.title} ${note.body} ${note.tag}`.toLocaleLowerCase().includes(q)) : notes;
}
export function toggleTask(tasks: Task[], id: string): Task[] {
  return tasks.map(task => task.id === id ? { ...task, done: !task.done } : task);
}
export function deleteTask(tasks: Task[], id: string): Task[] { return tasks.filter(task => task.id !== id); }
export function upsertNote(notes: Note[], note: Note): Note[] {
  return notes.some(item => item.id === note.id) ? notes.map(item => item.id === note.id ? note : item) : [note, ...notes];
}
export function deleteNote(notes: Note[], id: string): Note[] { return notes.filter(note => note.id !== id); }
export function addGoalProgress(goals: Goal[], id: string, amount = 5): Goal[] {
  return goals.map(goal => goal.id === id ? { ...goal, progress: Math.min(100, Math.max(0, goal.progress + amount)) } : goal);
}
export function toggleHabit(habits: string[], name: string): string[] {
  return habits.includes(name) ? habits.filter(habit => habit !== name) : [...habits, name];
}
export function dashboardStats(tasks: Task[], goals: Goal[]) {
  const complete = tasks.filter(task => task.done).length;
  return { complete, total: tasks.length, percent: tasks.length ? Math.round(complete / tasks.length * 100) : 0,
    highPriority: tasks.filter(task => task.priority === 'High' && !task.done).length,
    goalProgress: goals.length ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 0 };
}
export function secondsRemaining(start: number | null, minutes: number, now: number, pausedRemaining?: number | null): number {
  const duration = pausedRemaining ?? minutes * 60;
  return start ? Math.max(0, duration - Math.floor((now - start) / 1000)) : duration;
}
