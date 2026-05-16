// ============================================================
// EazyRide + Haye! — Lottery Screen v2.2.0
// Daily lottery draws, ticket purchases, streaks
// ============================================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import client from '../../api/client';

export default function LotteryScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [lottery, setLottery] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [buying, setBuying] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => { fetchLottery(); }, []);

  const fetchLottery = async () => {
    try {
      const { data } = await client.get('/lottery/active');
      setLottery(data.data || data);
      // No /lottery/my-tickets endpoint; leaving tickets empty
      setTickets([]);
    } catch (e) {
      console.log('Lottery fetch error:', e?.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => { setRefreshing(true); await fetchLottery(); };

  const buyTickets = async () => {
    if (!lottery) return;
    setBuying(true);
    try {
      const { data } = await client.post(`/lottery/${lottery.id}/ticket`, { quantity });
      Alert.alert('🎰 Tickets Purchased!', `You bought ${quantity} ticket${quantity > 1 ? 's' : ''}!`);
      fetchLottery();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to buy tickets');
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><Text style={styles.loadingText}>Loading lottery...</Text></View>;
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
      {lottery ? (
        <View style={styles.lotteryCard}>
          <Text style={styles.lotteryEmoji}>🎰</Text>
          <Text style={styles.lotteryTitle}>{lottery.name || 'Daily Draw'}</Text>
          <Text style={styles.lotteryPrize}>Prize: ${(lottery.prizePool || 0).toFixed(2)}</Text>
          <Text style={styles.lotteryInfo}>
            Ticket Price: ${(lottery.ticketPrice || 0).toFixed(2)} | Sold: {lottery.soldTickets || 0}/{lottery.maxTickets || '∞'}
          </Text>
          <Text style={styles.lotteryInfo}>
            Draw: {lottery.drawDate ? new Date(lottery.drawDate).toLocaleDateString() : 'Coming soon'}
          </Text>

          <View style={styles.quantityRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.min(10, quantity + 1))}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.buyButton} onPress={buyTickets} disabled={buying}>
            <Text style={styles.buyButtonText}>
              {buying ? 'Purchasing...' : `Buy ${quantity} Ticket${quantity > 1 ? 's' : ''} — $${((lottery.ticketPrice || 0) * quantity).toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.noLottery}>
          <Text style={styles.noLotteryEmoji}>🎰</Text>
          <Text style={styles.noLotteryText}>No active lottery right now</Text>
          <Text style={styles.noLotterySubtext}>Check back later for the next draw!</Text>
        </View>
      )}

      <View style={styles.ticketsSection}>
        <Text style={styles.sectionTitle}>My Tickets</Text>
        {tickets.length === 0 ? (
          <Text style={styles.noTickets}>No tickets yet. Buy one above!</Text>
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.ticketCard}>
                <View style={styles.ticketLeft}>
                  <Text style={styles.ticketNumber}>🎫 {item.ticketNumber}</Text>
                  <Text style={styles.ticketDate}>{new Date(item.purchasedAt).toLocaleDateString()}</Text>
                </View>
                <View style={styles.ticketRight}>
                  {item.isWinner ? (
                    <Text style={styles.winnerBadge}>🏆 WINNER!</Text>
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
  lotteryTitle: { fontSize: 24, fontWeight: '700', color: C.text, marginBottom: 4 },
  lotteryPrize: { fontSize: 20, fontWeight: '700', color: '#FFD700', marginBottom: 8 },
  lotteryInfo: { fontSize: 14, color: C.textSecondary, marginBottom: 4 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 16 },
  qtyBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  qtyValue: { fontSize: 24, fontWeight: '700', color: C.text, minWidth: 40, textAlign: 'center' },
  buyButton: { backgroundColor: '#FFD700', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8 },
  buyButtonText: { color: '#111', fontWeight: '700', fontSize: 16, textAlign: 'center' },
  noLottery: { margin: 24, alignItems: 'center' },
  noLotteryEmoji: { fontSize: 48, marginBottom: 8 },
  noLotteryText: { fontSize: 18, fontWeight: '600', color: C.text },
  noLotterySubtext: { fontSize: 14, color: C.textSecondary, marginTop: 4 },
  ticketsSection: { margin: 16, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 12 },
  noTickets: { color: C.textSecondary, fontSize: 14, textAlign: 'center', padding: 16 },
  ticketCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#FFD700' },
  ticketLeft: {},
  ticketNumber: { fontSize: 16, fontWeight: '600', color: C.text },
  ticketDate: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  ticketRight: {},
  winnerBadge: { backgroundColor: '#DCFCE7', color: '#0B6623', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontWeight: '700', fontSize: 12 },
  pendingBadge: { backgroundColor: '#FEF3C7', color: '#D97706', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontWeight: '700', fontSize: 12 },
});
