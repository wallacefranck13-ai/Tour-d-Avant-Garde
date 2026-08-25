import AsyncStorage from '@react-native-async-storage/async-storage';

// En développement avec Expo Go sur un appareil physique, remplacez
// "localhost" par l'adresse IP locale de votre machine (ex: 192.168.1.20).
export const API_BASE = 'http://localhost:3050/api/v1';

const CACHE_KEYS = {
  dashboard: 'tag_cache_dashboard',
  prayerRequests: 'tag_cache_prayer_requests',
  meetings: 'tag_cache_meetings',
  notifications: 'tag_cache_notifications',
};
let lastFetchFromCache = false;

export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem('tag_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function readCache<T>(key: string): Promise<T | null> {
  const cached = await AsyncStorage.getItem(key);
  return cached ? (JSON.parse(cached) as T) : null;
}

async function writeCache(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function wasLastFetchFromCache() {
  return lastFetchFromCache;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Identifiants invalides');
  }
  const data: { accessToken: string; user: CurrentUser } = await res.json();
  await AsyncStorage.setItem('tag_token', data.accessToken);
  await AsyncStorage.setItem('tag_user', JSON.stringify(data.user));
  return data;
}

export async function logout() {
  await AsyncStorage.multiRemove(['tag_token', 'tag_user', ...Object.values(CACHE_KEYS)]);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const raw = await AsyncStorage.getItem('tag_user');
  return raw ? JSON.parse(raw) : null;
}

export async function getToken() {
  return AsyncStorage.getItem('tag_token');
}

export async function getValidToken() {
  const token = await getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(token.split('.')[1]))));
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      await logout();
      return null;
    }
  } catch {
    await logout();
    return null;
  }
  return token;
}

export async function fetchDashboardOverview() {
  lastFetchFromCache = false;
  try {
    const res = await fetch(`${API_BASE}/dashboard/overview`, { headers: await authHeaders() });
    if (!res.ok) throw new Error('offline');
    const data = await res.json();
    await writeCache(CACHE_KEYS.dashboard, data);
    return data;
  } catch {
    const cached = await readCache<any>(CACHE_KEYS.dashboard);
    if (cached) {
      lastFetchFromCache = true;
      return cached;
    }
    throw new Error('offline');
  }
}

export async function fetchPrayerRequests() {
  lastFetchFromCache = false;
  try {
    const res = await fetch(`${API_BASE}/prayer-requests`, { headers: await authHeaders() });
    if (!res.ok) throw new Error('offline');
    const data = await res.json();
    await writeCache(CACHE_KEYS.prayerRequests, data);
    return data;
  } catch {
    const cached = await readCache<any[]>(CACHE_KEYS.prayerRequests);
    if (cached) {
      lastFetchFromCache = true;
      return cached;
    }
    throw new Error('offline');
  }
}

export async function createPrayerRequest(input: { authorName: string; phone: string; subject: string; description?: string; category?: string; source?: string; isUrgent?: boolean }) {
  const res = await fetch(`${API_BASE}/prayer-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Impossible de déposer la demande');
  }
  return res.json();
}

export async function updatePrayerRequestStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE}/prayer-requests/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'offline');
  }
  return res.json();
}

export async function fetchMeetings() {
  lastFetchFromCache = false;
  try {
    const res = await fetch(`${API_BASE}/meetings`, { headers: await authHeaders() });
    if (!res.ok) throw new Error('offline');
    const data = await res.json();
    await writeCache(CACHE_KEYS.meetings, data);
    return data;
  } catch {
    const cached = await readCache<any[]>(CACHE_KEYS.meetings);
    if (cached) {
      lastFetchFromCache = true;
      return cached;
    }
    throw new Error('offline');
  }
}

export async function fetchNotifications() {
  lastFetchFromCache = false;
  try {
    const res = await fetch(`${API_BASE}/notifications`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(res.status === 403 ? 'forbidden' : 'offline');
    const data = await res.json();
    await writeCache(CACHE_KEYS.notifications, data);
    return data;
  } catch (error) {
    if (error instanceof Error && error.message === 'forbidden') throw error;
    const cached = await readCache<any[]>(CACHE_KEYS.notifications);
    if (cached) {
      lastFetchFromCache = true;
      return cached;
    }
    throw new Error('offline');
  }
}

export async function createMeeting(input: { title: string; startAt: string; type?: string; location?: string; description?: string }) {
  const res = await fetch(`${API_BASE}/meetings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Impossible de créer la réunion');
  }
  return res.json();
}
