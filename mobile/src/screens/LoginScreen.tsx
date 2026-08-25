import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { login } from '../api';

export default function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState('responsable@tourdavantgarde.org');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) {
      setError('L’email et le mot de passe sont obligatoires.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      onLoggedIn();
    } catch (e: any) {
      setError(e.message || 'Impossible de se connecter');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.brandMark}>
        <Text style={styles.brandMarkText}>✦</Text>
      </View>
      <Text style={styles.title}>Tour d'Avant-Garde</Text>
      <Text style={styles.subtitle}>Connexion responsable</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
        textContentType="emailAddress"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput style={styles.input} placeholder="Mot de passe" secureTextEntry textContentType="password" value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Se connecter</Text>}
      </TouchableOpacity>

      <Text style={styles.hint}>Compte de démonstration : responsable@tourdavantgarde.org / password123</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#101b3d', justifyContent: 'center', padding: 28 },
  brandMark: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#f8c84a', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  brandMarkText: { fontSize: 26, fontWeight: '900', color: '#1b1730' },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: '#9aa5c9', textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12 },
  button: { backgroundColor: '#6d32e9', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700' },
  error: { backgroundColor: '#fdecec', color: '#c0392b', padding: 10, borderRadius: 8, marginBottom: 12, textAlign: 'center' },
  hint: { color: '#7484b3', fontSize: 11, textAlign: 'center', marginTop: 20 },
});
