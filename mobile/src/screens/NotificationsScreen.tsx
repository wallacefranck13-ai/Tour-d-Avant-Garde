import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { fetchNotifications, wasLastFetchFromCache } from '../api';

interface NotificationItem {
  id: string;
  channel: string;
  title: string;
  body?: string;
  status: string;
  createdAt: string;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
      setOffline(wasLastFetchFromCache());
      setForbidden(false);
    } catch (error: any) {
      setOffline(error?.message !== 'forbidden');
      setForbidden(error?.message === 'forbidden');
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

  useEffect(() => {
    if (forbidden) Alert.alert('Accès limité', 'Les notifications sont réservées aux responsables et intercesseurs.');
  }, [forbidden]);

  return (
    <FlatList
      style={styles.wrap}
      data={notifications}
      keyExtractor={(item: NotificationItem) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={<View style={styles.header}><Text style={styles.title}>Notifications</Text>{offline && <Text style={styles.offline}>Données en cache — tirez pour actualiser.</Text>}{forbidden && <Text style={styles.offline}>Accès réservé aux responsables et intercesseurs.</Text>}</View>}
      renderItem={({ item }: { item: NotificationItem }) => <View style={styles.row}><View style={styles.icon}><Text style={styles.iconText}>{item.channel === 'email' ? '@' : '•'}</Text></View><View style={styles.copy}><Text style={styles.itemTitle}>{item.title}</Text><Text style={styles.meta}>{item.channel} · {formatDate(item.createdAt)} · {item.status}</Text>{item.body ? <Text style={styles.body}>{item.body}</Text> : null}</View></View>}
      ListEmptyComponent={<Text style={styles.empty}>{forbidden ? 'Aucune donnée accessible.' : 'Aucune notification pour le moment.'}</Text>}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f7f8fc' },
  header: { padding: 20, paddingTop: 56 },
  title: { fontSize: 22, fontWeight: '800' },
  offline: { backgroundColor: '#fff4df', color: '#9a5a00', marginTop: 12, padding: 10, borderRadius: 8, textAlign: 'center' },
  row: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 10, flexDirection: 'row', gap: 12 },
  icon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  iconText: { color: '#6530d8', fontWeight: '800' },
  copy: { flex: 1 },
  itemTitle: { fontWeight: '700' },
  meta: { color: '#718096', fontSize: 12, marginTop: 4 },
  body: { color: '#425066', marginTop: 7, lineHeight: 19 },
  empty: { textAlign: 'center', color: '#718096', marginTop: 40 },
});
