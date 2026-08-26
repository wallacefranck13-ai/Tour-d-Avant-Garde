import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import MeetingsScreen from './MeetingsScreen';
import { createMeeting, fetchMeetings, getCurrentUser } from '../api';

jest.mock('../api');

// FlatList + deux effets asynchrones enchaînés (getCurrentUser + load) peuvent
// être lents sur un runner CI chargé ; marge au-delà du défaut de 5000 ms.
jest.setTimeout(15000);

const mockedFetch = fetchMeetings as jest.MockedFunction<typeof fetchMeetings>;
const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockedCreate = createMeeting as jest.MockedFunction<typeof createMeeting>;

const MEETINGS = [{ id: 'm1', title: 'Veillée de prière', startAt: '2026-09-01T19:00:00Z', location: 'Salle A' }];

describe('MeetingsScreen', () => {
  beforeEach(() => {
    mockedFetch.mockReset().mockResolvedValue(MEETINGS);
    mockedCreate.mockReset();
    mockedGetCurrentUser.mockReset();
  });

  it('affiche les réunions à venir', async () => {
    mockedGetCurrentUser.mockResolvedValueOnce({ id: 'u1', fullName: 'Marie', email: 'm@x.org', role: 'MEMBRE' });

    const { findByText } = render(<MeetingsScreen />);

    expect(await findByText('Veillée de prière')).toBeTruthy();
  });

  it('un membre simple ne voit pas le bouton pour créer une réunion', async () => {
    mockedGetCurrentUser.mockResolvedValueOnce({ id: 'u1', fullName: 'Marie', email: 'm@x.org', role: 'MEMBRE' });

    const { findByText, queryByText } = render(<MeetingsScreen />);
    await findByText('Veillée de prière');

    expect(queryByText('+ Ajouter une réunion')).toBeNull();
  });

  it('un responsable peut créer une réunion', async () => {
    mockedGetCurrentUser.mockResolvedValueOnce({ id: 'u2', fullName: 'Paul', email: 'p@x.org', role: 'RESPONSABLE' });
    mockedCreate.mockResolvedValueOnce({ id: 'm2' });

    const { findByText, getByPlaceholderText, getByText } = render(<MeetingsScreen />);
    fireEvent.press(await findByText('+ Ajouter une réunion'));

    fireEvent.changeText(getByPlaceholderText('Titre'), 'Nuit de veille');
    fireEvent.changeText(getByPlaceholderText('Date ISO (2026-08-30T19:00:00Z)'), '2026-09-05T20:00:00Z');
    fireEvent.press(getByText('Créer'));

    await waitFor(() =>
      expect(mockedCreate).toHaveBeenCalledWith({
        title: 'Nuit de veille',
        startAt: new Date('2026-09-05T20:00:00Z').toISOString(),
        location: undefined,
      }),
    );
  });

  it('refuse la création si le titre ou la date manque', async () => {
    mockedGetCurrentUser.mockResolvedValueOnce({ id: 'u2', fullName: 'Paul', email: 'p@x.org', role: 'RESPONSABLE' });

    const { findByText, getByText } = render(<MeetingsScreen />);
    fireEvent.press(await findByText('+ Ajouter une réunion'));
    fireEvent.press(getByText('Créer'));

    expect(mockedCreate).not.toHaveBeenCalled();
  });
});
