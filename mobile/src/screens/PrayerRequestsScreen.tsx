import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createPrayerRequest, fetchPrayerRequests, getCurrentUser, updatePrayerRequestStatus, wasLastFetchFromCache } from '../api';

const STATUS_OPTIONS = ['NEW', 'IN_PROGRESS', 'ASSIGNED', 'ANSWERED', 'ARCHIVED'];
const STATUS_LABELS: Record<string, string> = {
  NEW: 'Nouvelle',
  IN_PROGRESS: 'En cours',
  ASSIGNED: 'Assignée',
  ANSWERED: 'Exaucée',
  ARCHIVED: 'Archivée',
};
const STATUS_COLORS: Record<string, string> = {
  NEW: '#6530d8',
  IN_PROGRESS: '#b76a00',
  ASSIGNED: '#2563eb',
  ANSWERED: '#16803d',
  ARCHIVED: '#657084',
};

interface PrayerRequest {
  id: string;
  authorName: string;
  subject: string;
  status: string;
  isUrgent: boolean;
}

export default function PrayerRequestsScreen() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      setAuthorName(currentUser?.fullName || '');
      setPhone(currentUser?.phone || '');
      setCanManage(currentUser?.role === 'RESPONSABLE' || currentUser?.role === 'INTERCESSEUR');
    });
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await fetchPrayerRequests();
      setRequests(data);
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

  async function handleStatusChange(id: string, status: string) {
    try {
      await updatePrayerRequestStatus(id, status);
      setExpandedId(null);
      await load();
    } catch (e: any) {
      Alert.alert('Mise à jour impossible', 'Le statut n’a pas pu être modifié. Vérifiez votre connexion et réessayez.');
    }
  }

  async function handleCreate() {
    if (!authorName.trim() || !phone.trim() || !subject.trim()) {
      Alert.alert('Informations manquantes', 'Le nom, le téléphone et le sujet sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      await createPrayerRequest({ authorName: authorName.trim(), phone: phone.trim(), subject: subject.trim(), description: description.trim() || undefined, source: 'mobile' });
      setFormOpen(false);
      setSubject('');
      setDescription('');
      await load();
      Alert.alert('Demande déposée', 'Votre demande a bien été transmise à la communauté.');
    } catch (e: any) {
      Alert.alert('Dépôt impossible', e?.message || 'Vérifiez votre connexion et réessayez.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <FlatList
      style={styles.wrap}
      data={requests}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Demandes de prière</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setFormOpen(true)}><Text style={styles.primaryButtonText}>+ Déposer une demande</Text></TouchableOpacity>
          {offline && <Text style={styles.offline}>Backend hors ligne — tirez pour réessayer.</Text>}
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.row} disabled={!canManage} onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.author}>
              {item.authorName}
              {item.isUrgent ? ' 🔴' : ''}
            </Text>
            <Text style={styles.subject}>{item.subject}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>{STATUS_LABELS[item.status] || item.status}</Text>
          </View>
          {expandedId === item.id && (
            <View style={styles.statusPicker}>
              {STATUS_OPTIONS.map((s) => (
                <TouchableOpacity key={s} style={styles.statusOption} onPress={() => handleStatusChange(item.id, s)}>
                  <Text style={{ color: STATUS_COLORS[s] }}>{STATUS_LABELS[s]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.empty}>Aucune requête pour le moment.</Text>}
      ListFooterComponent={<Modal visible={formOpen} animationType="slide" transparent onRequestClose={() => setFormOpen(false)}><View style={styles.modalBackdrop}><View style={styles.modalCard}><Text style={styles.modalTitle}>Déposer une demande</Text><TextInput style={styles.input} placeholder="Nom complet" value={authorName} onChangeText={setAuthorName} /><TextInput style={styles.input} placeholder="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" /><TextInput style={styles.input} placeholder="Sujet de prière" value={subject} onChangeText={setSubject} /><TextInput style={[styles.input, styles.textarea]} placeholder="Description (facultatif)" value={description} onChangeText={setDescription} multiline /><View style={styles.modalActions}><TouchableOpacity style={styles.cancelButton} onPress={() => setFormOpen(false)}><Text>Annuler</Text></TouchableOpacity><TouchableOpacity style={styles.primaryButton} disabled={saving} onPress={handleCreate}><Text style={styles.primaryButtonText}>{saving ? 'Envoi...' : 'Déposer'}</Text></TouchableOpacity></View></View></View></Modal>}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f7f8fc' },
  header: { padding: 20, paddingTop: 56 },
  title: { fontSize: 22, fontWeight: '800' },
  offline: { backgroundColor: '#fdecec', color: '#c0392b', marginTop: 12, padding: 10, borderRadius: 8, textAlign: 'center' },
  row: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  author: { fontWeight: '700' },
  subject: { color: '#718096', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  statusPicker: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, borderTopWidth: 1, borderTopColor: '#f0f1f6', paddingTop: 10 },
  statusOption: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f7f8fc' },
  empty: { textAlign: 'center', color: '#718096', marginTop: 40 },
  primaryButton: { backgroundColor: '#6530d8', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 9, marginTop: 14, alignSelf: 'flex-start' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,.45)' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 14 },
  input: { borderWidth: 1, borderColor: '#dfe3ed', borderRadius: 9, padding: 11, marginBottom: 10, backgroundColor: '#fff' },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: 4 },
  cancelButton: { paddingHorizontal: 12, paddingVertical: 10 },
});
