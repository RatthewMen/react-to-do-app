'use client';

import { FormEvent, useState } from 'react';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/client';

export function AddTodoForm(props: { uid: string }) {
  const { uid } = props;
  const [title, setTitle] = useState('');
  const [dueAtLocal, setDueAtLocal] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const data: Record<string, unknown> = {
        title: title.trim(),
        completed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      if (dueAtLocal) {
        // Store as Firestore Timestamp based on user's local datetime selection
        data.dueAt = Timestamp.fromDate(new Date(dueAtLocal));
      }
      await addDoc(collection(db, 'users', uid, 'todos'), data);
      setTitle('');
      setDueAtLocal('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mb-4 flex gap-2">
      <input
        className="flex-1"
        placeholder="Add a new task…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="datetime-local"
        className="w-56"
        value={dueAtLocal}
        onChange={(e) => setDueAtLocal(e.target.value)}
        aria-label="Due date and time"
      />
      <button disabled={loading}>{loading ? 'Adding…' : 'Add'}</button>
    </form>
  );
}



