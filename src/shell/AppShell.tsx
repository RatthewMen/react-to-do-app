import { Link, Outlet } from 'react-router-dom';

export function AppShell() {
	return (
		<>
			<header className="border-b">
				<div className="container flex items-center justify-between py-4">
					<Link to="/" className="font-semibold">Do‑To App</Link>
					<nav className="space-x-4">
						<Link to="/auth/login">Login</Link>
						<Link to="/auth/signup">Sign up</Link>
					</nav>
				</div>
			</header>
			<main className="container py-6">
				<Outlet />
			</main>
		</>
	);
}



