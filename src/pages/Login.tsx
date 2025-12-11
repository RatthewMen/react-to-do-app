import { FormEvent, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom';

function isEmail(input: string) {
	return /\S+@\S+\.\S+/.test(input);
}

export function Login() {
	const navigate = useNavigate();
	const location = useLocation();
	const [identifier, setIdentifier] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const params = new URLSearchParams(location.search);
	const nextPath = params.get('next') || '/app';

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			let email = identifier.trim();
			if (!isEmail(email)) {
				const key = email.toLowerCase();
				const unameSnap = await getDoc(doc(db, 'usernames', key));
				if (!unameSnap.exists()) throw new Error('Username not found');
				const data = unameSnap.data() as { email?: string };
				if (!data.email) throw new Error('Username record missing email');
				email = data.email;
			}
			await signInWithEmailAndPassword(auth, email, password);
			navigate(nextPath, { replace: true });
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Login failed');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="max-w-md">
			<h1 className="mb-4 text-2xl font-semibold">Login</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label>Email or Username</label>
					<input
						className="mt-1 w-full"
						value={identifier}
						onChange={(e) => setIdentifier(e.target.value)}
						autoComplete="username"
						required
					/>
				</div>
				<div>
					<label>Password</label>
					<input
						type="password"
						className="mt-1 w-full"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						autoComplete="current-password"
						required
					/>
				</div>
				{error && <p className="text-sm text-red-600">{error}</p>}
				<button type="submit" disabled={loading} className="w-full">
					{loading ? 'Logging in…' : 'Login'}
				</button>
			</form>
		</div>
	);
}



