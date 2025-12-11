import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Vite exposes environment variables via `import.meta.env` and only those prefixed with `VITE_`.
// For compatibility, also fall back to NEXT_PUBLIC_ prefixed vars if provided.
const env = import.meta.env as Record<string, string | undefined>;

// Project-provided fallback configuration (from user)
const defaultFirebaseConfig = {
	apiKey: "AIzaSyA-3hqBhT2yEZFElq_VijjlTeAPMHa2MBQ",
	authDomain: "to-do-app-ratthew.firebaseapp.com",
	projectId: "to-do-app-ratthew",
	storageBucket: "to-do-app-ratthew.firebasestorage.app",
	messagingSenderId: "293625032608",
	appId: "1:293625032608:web:22057568189f38bd2e7ec5"
};

const firebaseConfig = {
	apiKey: env.VITE_FIREBASE_API_KEY ?? env.NEXT_PUBLIC_FIREBASE_API_KEY ?? defaultFirebaseConfig.apiKey,
	authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? defaultFirebaseConfig.authDomain,
	projectId: env.VITE_FIREBASE_PROJECT_ID ?? env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? defaultFirebaseConfig.projectId,
	storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? defaultFirebaseConfig.storageBucket,
	messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? defaultFirebaseConfig.messagingSenderId,
	appId: env.VITE_FIREBASE_APP_ID ?? env.NEXT_PUBLIC_FIREBASE_APP_ID ?? defaultFirebaseConfig.appId
};

// Ensure required keys exist after applying fallbacks
for (const [key, value] of Object.entries(firebaseConfig)) {
	if (!value) throw new Error(`Missing Firebase config value for ${key}`);
}

let app: FirebaseApp;
if (!getApps().length) {
	app = initializeApp(firebaseConfig as NonNullable<typeof firebaseConfig>);
} else {
	app = getApps()[0]!;
}

export const firebaseApp = app;
export const auth = getAuth(app);
export const db = getFirestore(app);


