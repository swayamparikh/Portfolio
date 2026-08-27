'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken } from './api';
import type { Business } from './types';

interface StoreState {
  ready: boolean;
  authed: boolean;
  user: { id: string; email: string; name?: string } | null;
  businesses: Business[];
  activeBusiness: Business | null;
  setActiveBusinessId: (id: string) => void;
  refreshBusinesses: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const StoreCtx = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<StoreState['user']>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();

  const refreshBusinesses = useCallback(async () => {
    const list: Business[] = await api.listBusinesses();
    setBusinesses(list);
    if (list.length) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('ledgerlite.activeBiz') : null;
      const match = list.find((b) => b.id === stored);
      setActiveId(match ? match.id : list[0].id);
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ledgerlite.token') : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('ledgerlite.user') : null;
    if (token && storedUser) {
      setAuthed(true);
      setUser(JSON.parse(storedUser));
      refreshBusinesses().finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [refreshBusinesses]);

  const persistSession = (token: string, u: any) => {
    setToken(token);
    localStorage.setItem('ledgerlite.user', JSON.stringify(u));
    setUser(u);
    setAuthed(true);
  };

  const login = async (email: string, password: string) => {
    const { token, user } = await api.login(email, password);
    persistSession(token, user);
    await refreshBusinesses();
    router.push('/');
  };

  const signup = async (email: string, password: string, name?: string) => {
    const { token, user } = await api.signup(email, password, name);
    persistSession(token, user);
    // First-run: create a starter business so the app isn't empty.
    await api.createBusiness({ name: `${name || 'My'} Business`, businessType: 'other', currency: 'USD' });
    await refreshBusinesses();
    router.push('/');
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('ledgerlite.user');
    localStorage.removeItem('ledgerlite.activeBiz');
    setAuthed(false);
    setUser(null);
    setBusinesses([]);
    router.push('/login');
  };

  const setActiveBusinessId = (id: string) => {
    setActiveId(id);
    localStorage.setItem('ledgerlite.activeBiz', id);
  };

  const activeBusiness = businesses.find((b) => b.id === activeId) || businesses[0] || null;

  return (
    <StoreCtx.Provider value={{ ready, authed, user, businesses, activeBusiness, setActiveBusinessId, refreshBusinesses, login, signup, logout }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function currencySymbol(code?: string) {
  return ({ USD: '$', INR: '₹', EUR: '€', GBP: '£' } as Record<string, string>)[code || 'USD'] || '$';
}
export function fmtMoney(n: number, code?: string) {
  const sym = currencySymbol(code);
  const sign = n < 0 ? '-' : '';
  return `${sign}${sym}${Math.abs(Math.round(n)).toLocaleString()}`;
}
