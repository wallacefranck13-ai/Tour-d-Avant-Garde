import React from 'react';
import { render } from '@testing-library/react-native';
import NotificationsScreen from './NotificationsScreen';
import { fetchNotifications, wasLastFetchFromCache } from '../api';

jest.mock('../api');

// FlatList + effet asynchrone peuvent être lents sur un runner CI chargé ;
// marge au-delà du défaut de 5000 ms.
jest.setTimeout(15000);

const mockedFetch = fetchNotifications as jest.MockedFunction<typeof fetchNotifications>;
const mockedWasCache = wasLastFetchFromCache as jest.MockedFunction<typeof wasLastFetchFromCache>;

describe('NotificationsScreen', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
    mockedWasCache.mockReset().mockReturnValue(false);
  });

  it('affiche les notifications chargées', async () => {
    mockedFetch.mockResolvedValueOnce([
      { id: 'n1', channel: 'whatsapp', title: 'Réunion demain', status: 'SENT', createdAt: '2026-08-25T10:00:00Z' },
    ]);

    const { findByText } = render(<NotificationsScreen />);

    expect(await findByText('Réunion demain')).toBeTruthy();
  });

  it("affiche un message d'accès limité en cas de 403 (RBAC)", async () => {
    mockedFetch.mockRejectedValueOnce(new Error('forbidden'));

    const { findByText } = render(<NotificationsScreen />);

    expect(await findByText(/réservé aux responsables/)).toBeTruthy();
  });

  it('affiche la bannière cache en cas d\'échec générique', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('offline'));

    const { findByText } = render(<NotificationsScreen />);

    expect(await findByText(/Données en cache/)).toBeTruthy();
  });
});
