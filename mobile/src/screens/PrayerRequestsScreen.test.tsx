import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import PrayerRequestsScreen from './PrayerRequestsScreen';
import { fetchPrayerRequests, getCurrentUser, updatePrayerRequestStatus, wasLastFetchFromCache } from '../api';

jest.mock('../api');
const mockedFetch = fetchPrayerRequests as jest.MockedFunction<typeof fetchPrayerRequests>;
const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockedUpdateStatus = updatePrayerRequestStatus as jest.MockedFunction<typeof updatePrayerRequestStatus>;
const mockedWasCache = wasLastFetchFromCache as jest.MockedFunction<typeof wasLastFetchFromCache>;

const REQUESTS = [{ id: 'r1', authorName: 'Jean B.', subject: 'Guérison', status: 'NEW', isUrgent: false }];

describe('PrayerRequestsScreen — contrôle de rôle', () => {
  beforeEach(() => {
    mockedFetch.mockReset().mockResolvedValue(REQUESTS);
    mockedUpdateStatus.mockReset();
    mockedWasCache.mockReset().mockReturnValue(false);
  });

  it('un membre simple ne peut pas ouvrir le sélecteur de statut', async () => {
    mockedGetCurrentUser.mockResolvedValueOnce({ id: 'u1', fullName: 'Marie', email: 'm@x.org', role: 'MEMBRE' });

    const { findByText, queryByText } = render(<PrayerRequestsScreen />);
    const row = await findByText('Guérison');

    fireEvent.press(row);

    // Le badge affiche toujours le statut courant ("Nouvelle") ; seul le
    // sélecteur d'options (ex. "Exaucée") doit rester caché pour ce rôle.
    expect(queryByText('Exaucée')).toBeNull();
  });

  it('un responsable peut ouvrir le sélecteur et changer le statut', async () => {
    mockedGetCurrentUser.mockResolvedValueOnce({ id: 'u2', fullName: 'Paul', email: 'p@x.org', role: 'RESPONSABLE' });

    const { findByText } = render(<PrayerRequestsScreen />);
    const row = await findByText('Guérison');

    fireEvent.press(row);
    const answeredOption = await findByText('Exaucée');
    fireEvent.press(answeredOption);

    await waitFor(() => expect(mockedUpdateStatus).toHaveBeenCalledWith('r1', 'ANSWERED'));
  });
});
