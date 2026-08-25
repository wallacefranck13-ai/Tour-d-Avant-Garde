import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fetchDashboardOverview, logout, wasLastFetchFromCache } from '../api';

export default function DashboardScreen({ onLoggedOut }: { onLoggedOut: () => void }) {
  const [overview, setOverview] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

  const load = useCallback(async (showError = false) => {
    try {
      const data = await fetchDashboardOverview();
      setOverview(data);
      setOffline(wasLastFetchFromCache());
    } catch {
      setOffline(true);
      if (showError) Alert.alert('Données indisponibles', 'Le tableau de bord n’a pas pu être actualisé. Vérifiez votre connexion et réessayez.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }

  async function handleLogout() {
    await logout();
    onLoggedOut();
  }

  const today = overview?.today;

  return (
    <ScrollView style={styles.wrap} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de bord</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>

      {offline && <Text style={styles.offline}>Backend hors ligne — tirez pour réessayer.</Text>}

      <View style={styles.grid}>
        <Stat label="Participants" value={today?.participants} color="#6d32e9" />
        <Stat label="Demandes reçues" value={today?.demandesRecues} color="#2563eb" />
        <Stat label="Urgentes" value={today?.urgentes} color="#f59e0b" />
        <Stat label="Intercesseurs connectés" value={today?.intercesseursConnectes} color="#16a34a" />
      </View>

      {overview?.worldIntention && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌍 {overview.worldIntention.title}</Text>
          {overview.worldIntention.items.map((item: string, i: number) => (
            <Text key={i} style={styles.item}>
              • {item}
            </Text>
          ))}
        </View>
      )}

      {overview?.session && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Session en cours</Text>
          <Text style={styles.item}>{overview.session.step}</Text>
          <Text style={styles.item}>
            Étape {overview.session.stepIndex}/{overview.session.totalSteps}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function Stat({ label, value, color }: { label: string; value: number | undefined; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f7f8fc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 56 },
  title: { fontSize: 22, fontWeight: '800' },
  logout: { color: '#6d32e9', fontWeight: '600' },
  offline: { backgroundColor: '#fdecec', color: '#c0392b', margin: 16, padding: 10, borderRadius: 8, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  stat: { backgroundColor: '#fff', borderRadius: 14, padding: 16, width: '46%', margin: 6 },
  statLabel: { color: '#718096', fontSize: 12 },
  statValue: { fontSize: 26, fontWeight: '800', marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, margin: 16 },
  cardTitle: { fontWeight: '700', marginBottom: 8 },
  item: { color: '#425066', marginBottom: 2 },
});
