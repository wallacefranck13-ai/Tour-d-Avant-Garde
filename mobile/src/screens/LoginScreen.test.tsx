import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import LoginScreen from './LoginScreen';
import { login } from '../api';

jest.mock('../api');
const mockedLogin = login as jest.MockedFunction<typeof login>;

describe('LoginScreen', () => {
  beforeEach(() => {
    mockedLogin.mockReset();
  });

  it('bloque la soumission et affiche une erreur si le mot de passe est vide', () => {
    const onLoggedIn = jest.fn();
    const { getByText } = render(<LoginScreen onLoggedIn={onLoggedIn} />);

    fireEvent.press(getByText('Se connecter'));

    expect(getByText(/obligatoires/)).toBeTruthy();
    expect(mockedLogin).not.toHaveBeenCalled();
    expect(onLoggedIn).not.toHaveBeenCalled();
  });

  it('appelle login() avec les identifiants saisis et onLoggedIn() en cas de succès', async () => {
    mockedLogin.mockResolvedValueOnce({
      accessToken: 'tok',
      user: { id: 'u1', fullName: 'Jean', email: 'responsable@tourdavantgarde.org', role: 'RESPONSABLE' },
    });
    const onLoggedIn = jest.fn();
    const { getByPlaceholderText, getByText } = render(<LoginScreen onLoggedIn={onLoggedIn} />);

    fireEvent.changeText(getByPlaceholderText('Mot de passe'), 'secret123');
    fireEvent.press(getByText('Se connecter'));

    await waitFor(() => expect(onLoggedIn).toHaveBeenCalled());
    expect(mockedLogin).toHaveBeenCalledWith('responsable@tourdavantgarde.org', 'secret123');
  });

  it('affiche le message d\'erreur renvoyé par le serveur en cas d\'échec', async () => {
    mockedLogin.mockRejectedValueOnce(new Error('Identifiants invalides'));
    const onLoggedIn = jest.fn();
    const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen onLoggedIn={onLoggedIn} />);

    fireEvent.changeText(getByPlaceholderText('Mot de passe'), 'wrong');
    fireEvent.press(getByText('Se connecter'));

    expect(await findByText('Identifiants invalides')).toBeTruthy();
    expect(onLoggedIn).not.toHaveBeenCalled();
  });
});
