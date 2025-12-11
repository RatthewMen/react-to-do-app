'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { TodoItem } from './TodoItem';

export function TodoList(props: { uid: string }) {
  const { uid } = props;
  const [todos, setTodos] = useState<
    Array<{ id: string; title: string; completed: boolean; dueAtMs: number | null }>
  >(
    []
  );

  useEffect(() => {
    const q = query(
      collection(db, 'users', uid, 'todos'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setTodos(
        snap.docs.map((d) => {
          const data = d.data() as any;
          const dueAtMs =
            data?.dueAt && typeof data.dueAt?.toMillis === 'function'
              ? data.dueAt.toMillis()
              : data?.dueAt?.seconds
              ? Number(data.dueAt.seconds) * 1000
              : null;
          return { id: d.id, title: data.title, completed: !!data.completed, dueAtMs };
        })
      );
    });
    return () => unsub();
  }, [uid]);

  if (!todos.length) {
    return <p className="text-gray-600">No tasks yet — add your first one!</p>;
  }

  return (
    <ul className="space-y-3">
      {todos.map((t) => (
        <TodoItem key={t.id} uid={uid} todo={t} />
      ))}
    </ul>
  );
}



