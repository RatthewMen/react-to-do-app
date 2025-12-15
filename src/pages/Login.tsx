import { FormEvent, useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function isEmail(input: string) {
	return /\S+@\S+\.\S+/.test(input);
}

function mapAuthError(code: string | undefined, fallback: string) {
	switch (code) {
		case 'auth/invalid-email':
			return 'Please enter a valid email address.';
		case 'auth/user-disabled':
			return 'This account has been disabled.';
		case 'auth/user-not-found':
		case 'auth/invalid-credential':
			return 'No account found for those credentials.';
		case 'auth/wrong-password':
			return 'Incorrect password. Please try again.';
		case 'auth/too-many-requests':
			return 'Too many attempts. Please try again later.';
		case 'auth/network-request-failed':
			return 'Network error. Check your connection and try again.';
		default:
			return fallback;
	}
}

export function Login() {
	const navigate = useNavigate();
	const location = useLocation();
	const [identifier, setIdentifier] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [resetting, setResetting] = useState(false);

	const params = new URLSearchParams(location.search);
	const nextPath = params.get('next') || '/app';

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setInfo(null);
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
			const code = (err as { code?: string } | null)?.code;
			const friendly = mapAuthError(code, 'Login failed. Please try again.');
			setError(friendly);
		} finally {
			setLoading(false);
		}
	}

	async function handleResetPassword() {
		if (!identifier.trim()) {
			setError('Enter your email or username to reset your password.');
			setInfo(null);
			return;
		}
		setResetting(true);
		setError(null);
		setInfo(null);
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
			await sendPasswordResetEmail(auth, email);
			setInfo('If an account exists for that email, a reset link has been sent.');
		} catch {
			// Intentionally do not reveal account existence
			setInfo('If an account exists for that email, a reset link has been sent.');
		} finally {
			setResetting(false);
		}
	}

	return (
		<div className="mx-auto max-w-md">
			<div className="rounded-lg border bg-white p-6 shadow-sm">
				<h1 className="mb-1 text-2xl font-semibold">Welcome back</h1>
				<p className="mb-6 text-sm text-gray-500">Sign in to continue to your dashboard.</p>

				<form onSubmit={handleSubmit} className="space-y-4" noValidate>
					<div>
						<label htmlFor="identifier" className="text-sm font-medium">Email or Username</label>
						<input
							id="identifier"
							className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
							value={identifier}
							onChange={(e) => setIdentifier(e.target.value)}
							autoComplete="username"
							required
							autoFocus
							aria-describedby={error ? 'login-error' : undefined}
							aria-invalid={!!error}
						/>
					</div>

					<div>
						<div className="mb-1 flex items-center justify-between">
							<label htmlFor="password" className="text-sm font-medium">Password</label>
							<button
								type="button"
								onClick={handleResetPassword}
								disabled={resetting || loading}
								className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50 bg-transparent border-0 p-0 h-auto rounded-none shadow-none focus:outline-none focus:ring-0"
							>
								Forgot password?
							</button>
						</div>
						<div className="relative">
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								className="mt-1 w-full rounded-md border px-3 py-2 pr-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete="current-password"
								required
								aria-describedby={error ? 'login-error' : undefined}
								aria-invalid={!!error}
							/>
							<button
								type="button"
								onClick={() => setShowPassword((s) => !s)}
								className="absolute inset-y-0 right-0 mr-2 flex items-center rounded px-2 text-xs text-gray-600 hover:bg-gray-100 bg-transparent border-0 shadow-none focus:outline-none focus:ring-0"
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{showPassword ? 'Hide' : 'Show'}
							</button>
						</div>
					</div>

					{error && (
						<p id="login-error" className="text-sm text-red-600" role="alert">
							{error}
						</p>
					)}
					{info && (
						<p className="text-sm text-green-600" role="status">
							{info}
						</p>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
					>
						{loading ? 'Logging in…' : 'Sign in'}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-gray-600">
					Don't have an account?{' '}
					<Link className="font-medium text-blue-600 hover:underline" to="/auth/signup">
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
}





