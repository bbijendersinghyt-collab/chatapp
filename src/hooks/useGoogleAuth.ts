import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  signInWithGoogle,
  signOutFromGoogle,
  getAccessToken,
  getCurrentUser,
  subscribeAuth,
} from '../services/googleAuth';

export function useGoogleAuth() {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [accessToken, setAccessToken] = useState<string | null>(getAccessToken());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeAuth((updatedUser, updatedToken) => {
      setUser(updatedUser);
      setAccessToken(updatedToken);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await signInWithGoogle();
      return res;
    } catch (err: any) {
      const message = err?.message || 'Google Sign-In failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOutFromGoogle();
    } catch (err: any) {
      setError(err?.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    accessToken,
    isAuthenticated: Boolean(user && accessToken),
    loading,
    error,
    login,
    logout,
  };
}
