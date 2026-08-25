import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createMeeting, fetchMeetings, getCurrentUser, wasLastFetchFromCache } from '../api';

interface Meeting {
  id: string;
  title: string;
  startAt: string;
  location?: string;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export default function MeetingsScreen() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => setCanCreate(user?.role === 'RESPONSABLE'));
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await fetchMeetings();
      setMeetings(data);
      setOffline(wasLastFetchFromCache());
    } catch {
      setOffline(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleCreate() {
    if (!title.trim() || !startAt.trim()) {
      Alert.alert('Informations manquantes', 'Le titre et la date ISO sont obligatoires.');
      return;
    }
    if (Number.isNaN(Date.parse(startAt))) {
      Alert.alert('Date invalide', 'Utilisez le format ISO, par exemple 2026-08-30T19:00:00Z.');
      return;
    }
    setSaving(true);
    try {
      await createMeeting({ title: title.trim(), startAt: new Date(startAt).toISOString(), location: location.trim() || undefined });
      setFormOpen(false);
      setTitle('');
      setStartAt('');
      setLocation('');
      await load();
      Alert.alert('Réunion créée', 'La réunion a été ajoutée à l’agenda.');
    } catch (e: any) {
      Alert.alert('Création impossible', e?.message || 'Vérifiez votre connexion et réessayez.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <FlatList
      style={styles.wrap}
      data={meetings}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Réunions</Text>
          {canCreate && <TouchableOpacity style={styles.primaryButton} onPress={() => setFormOpen(true)}><Text style={styles.primaryButtonText}>+ Ajouter une réunion</Text></TouchableOpacity>}
          {offline && <Text style={styles.offline}>Backend hors ligne — tirez pour réessayer.</Text>}
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.meetingTitle}>{item.title}</Text>
          <Text style={styles.meetingDate}>{formatDate(item.startAt)}</Text>
          {item.location ? <Text style={styles.meetingLocation}>{item.location}</Text> : null}
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>Aucune réunion programmée.</Text>}
      ListFooterComponent={<Modal visible={formOpen} animationType="slide" transparent onRequestClose={() => setFormOpen(false)}><View style={styles.modalBackdrop}><View style={styles.modalCard}><Text style={styles.modalTitle}>Ajouter une réunion</Text><TextInput style={styles.input} placeholder="Titre" value={title} onChangeText={setTitle} /><TextInput style={styles.input} placeholder="Date ISO (2026-08-30T19:00:00Z)" value={startAt} onChangeText={setStartAt} autoCapitalize="none" /><TextInput style={styles.input} placeholder="Lieu (facultatif)" value={location} onChangeText={setLocation} /><View style={styles.modalActions}><TouchableOpacity style={styles.cancelButton} onPress={() => setFormOpen(false)}><Text>Annuler</Text></TouchableOpacity><TouchableOpacity style={styles.primaryButton} disabled={saving} onPress={handleCreate}><Text style={styles.primaryButtonText}>{saving ? 'Création...' : 'Créer'}</Text></TouchableOpacity></View></View></View></Modal>}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f7f8fc' },
  header: { padding: 20, paddingTop: 56 },
  title: { fontSize: 22, fontWeight: '800' },
  offline: { backgroundColor: '#fdecec', color: '#c0392b', marginTop: 12, padding: 10, borderRadius: 8, textAlign: 'center' },
  row: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 10 },
  meetingTitle: { fontWeight: '700' },
  meetingDate: { color: '#718096', marginTop: 2 },
  meetingLocation: { color: '#718096', marginTop: 2, fontSize: 12 },
  empty: { textAlign: 'center', color: '#718096', marginTop: 40 },
  primaryButton: { backgroundColor: '#6530d8', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 9, marginTop: 14, alignSelf: 'flex-start' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,.45)' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 14 },
  input: { borderWidth: 1, borderColor: '#dfe3ed', borderRadius: 9, padding: 11, marginBottom: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: 4 },
  cancelButton: { paddingHorizontal: 12, paddingVertical: 10 },
});
