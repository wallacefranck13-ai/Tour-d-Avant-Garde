import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import DashboardScreen from './DashboardScreen';
import { fetchDashboardOverview, logout, wasLastFetchFromCache } from '../api';

jest.mock('../api');
const mockedFetch = fetchDashboardOverview as jest.MockedFunction<typeof fetchDashboardOverview>;
const mockedLogout = logout as jest.MockedFunction<typeof logout>;
const mockedWasCache = wasLastFetchFromCache as jest.MockedFunction<typeof wasLastFetchFromCache>;

describe('DashboardScreen', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
    mockedLogout.mockReset();
    mockedWasCache.mockReset().mockReturnValue(false);
  });

  it('affiche les statistiques du jour une fois chargées', async () => {
    mockedFetch.mockResolvedValueOnce({
      today: { participants: 12, demandesRecues: 4, urgentes: 1, intercesseursConnectes: 3 },
    });

    const { findByText } = render(<DashboardScreen onLoggedOut={jest.fn()} />);

    expect(await findByText('12')).toBeTruthy();
    expect(await findByText('4')).toBeTruthy();
  });

  it('affiche la bannière hors-ligne quand le backend est injoignable', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('offline'));

    const { findByText } = render(<DashboardScreen onLoggedOut={jest.fn()} />);

    expect(await findByText(/hors ligne/)).toBeTruthy();
  });

  it('appelle logout() et onLoggedOut() au clic sur déconnexion', async () => {
    mockedFetch.mockResolvedValueOnce({ today: { participants: 0, demandesRecues: 0, urgentes: 0, intercesseursConnectes: 0 } });
    const onLoggedOut = jest.fn();

    const { findByText, getByText } = render(<DashboardScreen onLoggedOut={onLoggedOut} />);
    await findByText('Tableau de bord');

    fireEvent.press(getByText('Se déconnecter'));

    await waitFor(() => expect(mockedLogout).toHaveBeenCalled());
    expect(onLoggedOut).toHaveBeenCalled();
  });
});
