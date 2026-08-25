import AsyncStorage from '@react-native-async-storage/async-storage';

function fakeJwt(payload: Record<string, unknown>) {
  const encode = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${encode({ alg: 'none' })}.${encode(payload)}.sig`;
}

function mockFetchOnce(status: number, body: unknown) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe('mobile api client', () => {
  beforeEach(() => {
    (AsyncStorage as any).__reset();
    global.fetch = jest.fn();
  });

  describe('login()', () => {
    it('stores the token and user on success', async () => {
      const { login } = await import('./api');
      mockFetchOnce(201, { accessToken: 'tok123', user: { id: 'u1', fullName: 'Jean', email: 'j@x.org', role: 'RESPONSABLE' } });

      const result = await login('j@x.org', 'secret');

      expect(result.accessToken).toBe('tok123');
      expect(await AsyncStorage.getItem('tag_token')).toBe('tok123');
      expect(JSON.parse((await AsyncStorage.getItem('tag_user'))!)).toMatchObject({ id: 'u1', role: 'RESPONSABLE' });
    });

    it('throws the server message on failure', async () => {
      const { login } = await import('./api');
      mockFetchOnce(401, { message: 'Identifiants invalides' });

      await expect(login('j@x.org', 'wrong')).rejects.toThrow('Identifiants invalides');
      expect(await AsyncStorage.getItem('tag_token')).toBeNull();
    });
  });

  describe('getValidToken()', () => {
    it('returns null when no token is stored', async () => {
      const { getValidToken } = await import('./api');
      expect(await getValidToken()).toBeNull();
    });

    it('returns the token when it is not expired', async () => {
      const { getValidToken } = await import('./api');
      const token = fakeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
      await AsyncStorage.setItem('tag_token', token);

      expect(await getValidToken()).toBe(token);
    });

    it('clears storage and returns null when the token is expired', async () => {
      const { getValidToken } = await import('./api');
      const token = fakeJwt({ exp: Math.floor(Date.now() / 1000) - 60 });
      await AsyncStorage.setItem('tag_token', token);
      await AsyncStorage.setItem('tag_user', JSON.stringify({ id: 'u1' }));

      expect(await getValidToken()).toBeNull();
      expect(await AsyncStorage.getItem('tag_token')).toBeNull();
      expect(await AsyncStorage.getItem('tag_user')).toBeNull();
    });

    it('clears storage and returns null for a malformed token', async () => {
      const { getValidToken } = await import('./api');
      await AsyncStorage.setItem('tag_token', 'not-a-jwt');

      expect(await getValidToken()).toBeNull();
      expect(await AsyncStorage.getItem('tag_token')).toBeNull();
    });
  });

  describe('fetchPrayerRequests() — cache fallback', () => {
    it('caches the live response on success', async () => {
      const { fetchPrayerRequests, wasLastFetchFromCache } = await import('./api');
      mockFetchOnce(200, [{ id: 'r1' }]);

      const data = await fetchPrayerRequests();

      expect(data).toEqual([{ id: 'r1' }]);
      expect(wasLastFetchFromCache()).toBe(false);
      expect(JSON.parse((await AsyncStorage.getItem('tag_cache_prayer_requests'))!)).toEqual([{ id: 'r1' }]);
    });

    it('falls back to the cache when the backend is unreachable', async () => {
      const { fetchPrayerRequests, wasLastFetchFromCache } = await import('./api');
      await AsyncStorage.setItem('tag_cache_prayer_requests', JSON.stringify([{ id: 'cached' }]));
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network down'));

      const data = await fetchPrayerRequests();

      expect(data).toEqual([{ id: 'cached' }]);
      expect(wasLastFetchFromCache()).toBe(true);
    });

    it('throws when the backend is unreachable and there is no cache', async () => {
      const { fetchPrayerRequests } = await import('./api');
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network down'));

      await expect(fetchPrayerRequests()).rejects.toThrow('offline');
    });
  });

  describe('fetchNotifications() — RBAC vs offline', () => {
    it('surfaces a forbidden error without falling back to cache', async () => {
      const { fetchNotifications } = await import('./api');
      await AsyncStorage.setItem('tag_cache_notifications', JSON.stringify([{ id: 'cached' }]));
      mockFetchOnce(403, { message: 'Forbidden' });

      await expect(fetchNotifications()).rejects.toThrow('forbidden');
    });

    it('falls back to cache on a generic failure', async () => {
      const { fetchNotifications } = await import('./api');
      await AsyncStorage.setItem('tag_cache_notifications', JSON.stringify([{ id: 'cached' }]));
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network down'));

      expect(await fetchNotifications()).toEqual([{ id: 'cached' }]);
    });
  });
});
