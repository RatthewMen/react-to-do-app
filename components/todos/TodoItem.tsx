'use client';

import { useEffect, useMemo, useState } from 'react';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/client';

export function TodoItem(props: {
  uid: string;
  todo: { id: string; title: string; completed: boolean; dueAtMs: number | null };
}) {
  const { uid, todo } = props;

  async function toggleComplete() {
    await updateDoc(doc(db, 'users', uid, 'todos', todo.id), {
      completed: !todo.completed,
      updatedAt: serverTimestamp()
    });
  }

  async function remove() {
    await deleteDoc(doc(db, 'users', uid, 'todos', todo.id));
  }

  const [nowMs, setNowMs] = useState<number>(Date.now());
  useEffect(() => {
    if (!todo.dueAtMs) return;
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [todo.dueAtMs]);

  function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts: string[] = [];
    if (days) parts.push(`${days}d`);
    parts.push(`${hours.toString().padStart(2, '0')}h`);
    parts.push(`${minutes.toString().padStart(2, '0')}m`);
    parts.push(`${seconds.toString().padStart(2, '0')}s`);
    return parts.join(' ');
  }

  const countdownText = useMemo(() => {
    if (!todo.dueAtMs) return null;
    const delta = todo.dueAtMs - nowMs;
    const abs = Math.abs(delta);
    const label = formatDuration(abs);
    return delta >= 0 ? `Due in ${label}` : `Overdue by ${label}`;
  }, [todo.dueAtMs, nowMs]);

  const dueAtAbsolute = useMemo(() => {
    if (!todo.dueAtMs) return null;
    const d = new Date(todo.dueAtMs);
    // Example: Jan 05, 2026, 14:30
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }, [todo.dueAtMs]);

  const isOverdue = Boolean(todo.dueAtMs && todo.dueAtMs < nowMs);

  return (
    <li className="flex items-center justify-between rounded border p-3">
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={todo.completed} onChange={toggleComplete} />
          <span className={todo.completed ? 'line-through text-gray-500' : ''}>{todo.title}</span>
        </label>
        {dueAtAbsolute && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">Due: {dueAtAbsolute}</span>
            {countdownText && (
              <span className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                {countdownText}
              </span>
            )}
          </div>
        )}
      </div>
      <button onClick={remove} className="bg-red-600 hover:bg-red-700">Delete</button>
    </li>
  );
}



