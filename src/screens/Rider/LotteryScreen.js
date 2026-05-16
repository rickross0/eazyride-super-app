// ============================================================
// EazyRide + Haye! — Lottery Screen v3.0.0
// Promotional Giveaway for Drivers (FREE ENTRY)
// ============================================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import client from '../../api/client';

export default function LotteryScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const styles = createStyles(colors);
  const [lottery, setLottery] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [entering, setEntering] = useState(false);
  const isDriver = user?.role === 'DRIVER';

  useEffect(() => { fetchLottery(); }, []);

  const fetchLottery = async () => {
    try {
      const [{ data: active }, { data: myEntries }] = await Promise.all([
        client.get('/lottery/active'),
        client.get('/lottery/my/entries').catch(() => ({ data: null })),
      ]);
      setLottery(active?.data || active || null);
      setEntries(myEntries?.data || []);
    } catch (e) {
      console.log('Lottery fetch error:', e?.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => { setRefreshing(true); await fetchLottery(); };

  const enterLottery = async () => {
    if (!lottery) return;
    if (!isDriver) {
      Alert.alert('Drivers Only', 'This promotional giveaway is exclusive to drivers.');
      return;
    }
    setEntering(true);
    try {
      const { data } = await client.post(`/lottery/${lottery.id}/enter`);
      Alert.alert('🎉 Entry Submitted!', data?.message || 'You have been entered into the draw!');
      fetchLottery();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.error || 'Failed to enter lottery');
    } finally {
      setEntering(false);
    }
  };

  const isEntered = lottery && entries.some(e => e.lotteryId === lottery.id);

  if (loading) {
    return (<View style={styles.center}>
      <Text style={styles.loadingText}>Loading giveaway...</Text>
    </View>);
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
      {lottery ? (
        <View style={styles.lotteryCard}>
          <Text style={styles.lotteryEmoji}>🎁</Text>
          <Text style={styles.lotteryTitle}>{lottery.title || 'Driver Giveaway'}</Text>
          {lottery.description ? <Text style={styles.lotteryDesc}>{lottery.description}</Text> : null}
          <Text style={styles.lotteryPrize}>Prize: ${(lottery.prizePool || 0).toFixed(2)}</Text>
          <Text style={styles.lotteryInfo}>
            Entries: {lottery.entryCount || 0}{lottery.entryLimit ? ` / ${lottery.entryLimit}` : ''}
          </Text>
          <Text style={styles.lotteryInfo}>
            Draw: {lottery.drawDate ? new Date(lottery.drawDate).toLocaleDateString() : 'Coming soon'}
          </Text>

          {!isDriver && (
            <View style={styles.driverBadge}>
              <Text style={styles.driverBadgeText}>🚕 Driver Exclusive</Text>
            </View>
          )}

          {isEntered ? (
            <View style={styles.enteredBadge}>
              <Text style={styles.enteredText}>✅ You are entered!</Text>
              <Text style={styles.enteredSubtext}>Good luck in the draw.</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.enterButton} onPress={enterLottery} disabled={entering}>
              <Text style={styles.enterButtonText}>
                {entering ? 'Submitting...' : isDriver ? '🎉 Enter for Free' : 'Drivers Only'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.noLottery}>
          <Text style={styles.noLotteryEmoji}>🎁</Text>
          <Text style={styles.noLotteryText}>No active giveaway</Text>
          <Text style={styles.noLotterySubtext}>Check back later for the next driver promotion!</Text>
        </View>
      )}

      <View style={styles.entriesSection}>
        <Text style={styles.sectionTitle}>My Entries</Text>
        {entries.length === 0 ? (
          <Text style={styles.noEntries}>No entries yet. Enter the active giveaway above!</Text>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.entryCard}>
                <View style={styles.entryLeft}>
                  <Text style={styles.entryNumber}>🎫 #{item.entryNumber}</Text>
                  <Text style={styles.entryLottery}>{item.lottery?.title || 'Giveaway'}</Text>
                  <Text style={styles.entryDate}>{new Date(item.enteredAt).toLocaleDateString()}</Text>
                </View>
                <View style={styles.entryRight}>
                  {item.isWinner ? (
                    <Text style={styles.winnerBadge}>🏆 WINNER!</Text>
                  ) : item.lottery?.status === 'COMPLETED' ? (
                    <Text style={styles.completedBadge}>Completed</Text>
                  ) : (
                    <Text style={styles.pendingBadge}>Pending</Text>
                  )}
                </View>
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  loadingText: { color: C.textSecondary, fontSize: 14 },
  lotteryCard: { margin: 16, backgroundColor: C.card, borderRadius: 16, padding: 24, alignItems: 'center', elevation: 3 },
  lotteryEmoji: { fontSize: 64, marginBottom: 8 },
  lotteryTitle: { fontSize: 24, fontWeight: '700', color: C.text, marginBottom: 4, textAlign: 'center' },
  lotteryDesc: { fontSize: 14, color: C.textSecondary, textAlign: 'center', marginBottom: 12 },
  lotteryPrize: { fontSize: 20, fontWeight: '700', color: '#FFD700', marginBottom: 8 },
  lotteryInfo: { fontSize: 14, color: C.textSecondary, marginBottom: 4 },
  driverBadge: { backgroundColor: '#2196F3', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginTop: 12 },
  driverBadgeText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  enteredBadge: { backgroundColor: '#E8F5E9', borderRadius: 12, padding: 16, marginTop: 16, alignItems: 'center', width: '100%' },
  enteredText: { color: '#2E7D32', fontWeight: '800', fontSize: 16 },
  enteredSubtext: { color: '#66BB6A', fontSize: 13, marginTop: 4 },
  enterButton: { backgroundColor: '#FFD700', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 32, marginTop: 16, width: '100%', alignItems: 'center' },
  enterButtonText: { color: '#111', fontWeight: '800', fontSize: 17, textAlign: 'center' },
  noLottery: { margin: 24, alignItems: 'center' },
  noLotteryEmoji: { fontSize: 48, marginBottom: 8 },
  noLotteryText: { fontSize: 18, fontWeight: '600', color: C.text },
  noLotterySubtext: { fontSize: 14, color: C.textSecondary, marginTop: 4 },
  entriesSection: { margin: 16, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 12 },
  noEntries: { color: C.textSecondary, fontSize: 14, textAlign: 'center', padding: 16 },
  entryCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#FFD700' },
  entryLeft: { flex: 1 },
  entryNumber: { fontSize: 16, fontWeight: '600', color: C.text },
  entryLottery: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
  entryDate: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  entryRight: {},
  winnerBadge: { backgroundColor: '#DCFCE7', color: '#0B6623', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontWeight: '700', fontSize: 12 },
  completedBadge: { backgroundColor: '#E0E0E0', color: '#666', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontWeight: '600', fontSize: 12 },
  pendingBadge: { backgroundColor: '#FEF3C7', color: '#D97706', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontWeight: '700', fontSize: 12 },
});
