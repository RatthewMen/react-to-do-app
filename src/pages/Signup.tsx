import { FormEvent, useEffect, useState } from 'react';
import { auth, db } from '@/firebase/client';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export function Signup() {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [available, setAvailable] = useState<boolean | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const key = username.trim().toLowerCase();
		if (!key) { setAvailable(null); return; }
		(async () => {
			try {
				const snap = await getDoc(doc(db, 'usernames', key));
				setAvailable(!snap.exists());
			} catch {
				setAvailable(null);
			}
		})();
	}, [username]);

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const key = username.trim().toLowerCase();
			if (!key) throw new Error('Username required');
			if (available === false) throw new Error('Username already taken');

			const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
			const { uid } = cred.user;
			await updateProfile(cred.user, { displayName: username.trim() });

			await runTransaction(db, async (tx) => {
				const unameRef = doc(db, 'usernames', key);
				const unameSnap = await tx.get(unameRef);
				if (unameSnap.exists()) throw new Error('Username already taken');
				const userRef = doc(db, 'users', uid);
				tx.set(unameRef, { uid, email: cred.user.email });
				tx.set(userRef, {
					email: cred.user.email,
					username: username.trim(),
					displayName: username.trim(),
					photoURL: cred.user.photoURL || null,
					createdAt: serverTimestamp(),
					lastLoginAt: serverTimestamp()
				});
			});

			navigate('/app', { replace: true });
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Sign up failed');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="max-w-md">
			<h1 className="mb-4 text-2xl font-semibold">Sign up</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label>Email</label>
					<input
						className="mt-1 w-full"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						autoComplete="email"
					/>
				</div>
				<div>
					<label>Username</label>
					<input
						className="mt-1 w-full"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
					/>
					{available === true && <p className="text-sm text-green-700">Username is available</p>}
					{available === false && <p className="text-sm text-red-700">Username is taken</p>}
				</div>
				<div>
					<label>Password</label>
					<input
						className="mt-1 w-full"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						autoComplete="new-password"
					/>
				</div>
				{error && <p className="text-sm text-red-600">{error}</p>}
				<button type="submit" disabled={loading} className="w-full">
					{loading ? 'Creating account…' : 'Create account'}
				</button>
			</form>
		</div>
	);
}





