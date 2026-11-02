import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

// In-memory token storage ONLY - never saved to localStorage or sessionStorage
let inMemoryAccessToken: string | null = null;
let currentUser: User | null = null;
const listeners = new Set<(user: User | null, token: string | null) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener(currentUser, inMemoryAccessToken));
}

// Track Firebase Auth state
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (!user) {
    inMemoryAccessToken = null;
  }
  notifyListeners();
});

export async function signInWithGoogle(): Promise<{ user: User; accessToken: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    if (!token) {
      throw new Error('Could not retrieve Gmail OAuth access token from Google sign in.');
    }

    inMemoryAccessToken = token;
    currentUser = result.user;
    notifyListeners();

    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
}

export async function signOutFromGoogle(): Promise<void> {
  await fbSignOut(auth);
  inMemoryAccessToken = null;
  currentUser = null;
  notifyListeners();
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export function subscribeAuth(listener: (user: User | null, token: string | null) => void): () => void {
  listeners.add(listener);
  // Immediate call with current state
  listener(currentUser, inMemoryAccessToken);
  return () => {
    listeners.delete(listener);
  };
}
