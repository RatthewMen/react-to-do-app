import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/firebase/client';
import { AddTodoForm } from '@/components/todos/AddTodoForm';
import { TodoList } from '@/components/todos/TodoList';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
	const navigate = useNavigate();
	const [uid, setUid] = useState<string | null>(null);
	const [email, setEmail] = useState<string | null>(null);
	const [stats, setStats] = useState<{ total: number; active: number; dueSoon: number; late: number }>({
		total: 0,
		active: 0,
		dueSoon: 0,
		late: 0
	});

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, async (user) => {
			if (user) {
				setUid(user.uid);
				setEmail(user.email);
			} else {
				setUid(null);
				setEmail(null);
				navigate('/auth/login', { replace: true });
			}
		});
		return () => unsub();
	}, [navigate]);

	// Subscribe to todos to compute dashboard stats
	useEffect(() => {
		if (!uid) return;
		const unsub = onSnapshot(collection(db, 'users', uid, 'todos'), (snap) => {
			const now = Date.now();
			let total = 0;
			let active = 0;
			let dueSoon = 0;
			let late = 0;

			snap.forEach((docSnap) => {
				total += 1;
				const data = docSnap.data() as any;
				const completed = !!data?.completed;

				// Only count scheduling-based stats for active (not completed) tasks
				if (!completed) {
					active += 1;
					const dueAtMs =
						data?.dueAt && typeof data.dueAt?.toMillis === 'function'
							? data.dueAt.toMillis()
							: data?.dueAt?.seconds
							? Number(data.dueAt.seconds) * 1000
							: null;
					if (dueAtMs != null) {
						const delta = dueAtMs - now;
						if (delta < 0) {
							late += 1;
						} else if (delta <= 24 * 60 * 60 * 1000) {
							dueSoon += 1;
						}
					}
				}
			});

			setStats({ total, active, dueSoon, late });
		});
		return () => unsub();
	}, [uid]);

	async function handleLogout() {
		await signOut(auth);
		navigate('/auth/login', { replace: true });
	}

	if (!uid) {
		return <p>Loading…</p>;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Your To‑Dos</h1>
					<p className="text-sm text-gray-600">{email}</p>
				</div>
				<button onClick={handleLogout} className="bg-gray-800 hover:bg-gray-900">Logout</button>
			</div>

			{/* Stats boxes */}
			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				<div className="rounded border p-4 text-center">
					<div className="text-xs uppercase text-gray-500">Total</div>
					<div className="text-2xl font-semibold">{stats.total}</div>
				</div>
				<div className="rounded border p-4 text-center">
					<div className="text-xs uppercase text-gray-500">Active</div>
					<div className="text-2xl font-semibold">{stats.active}</div>
				</div>
				<div className="rounded border p-4 text-center">
					<div className="text-xs uppercase text-gray-500">Due soon (24h)</div>
					<div className="text-2xl font-semibold text-amber-600">{stats.dueSoon}</div>
				</div>
				<div className="rounded border p-4 text-center">
					<div className="text-xs uppercase text-gray-500">Late</div>
					<div className="text-2xl font-semibold text-red-600">{stats.late}</div>
				</div>
			</div>

			<AddTodoForm uid={uid} />
			<TodoList uid={uid} />
		</div>
	);
}



