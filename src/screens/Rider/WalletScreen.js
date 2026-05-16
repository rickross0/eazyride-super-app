import { useTheme } from '../../contexts/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import client from '../../api/client';

export default function WalletScreen() {
  const { colors } = useTheme();
  const COLORS = colors;
  const styles = createStyles(colors);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositPhone, setDepositPhone] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('EVC');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const loadData = async () => {
    try {
      const { data: bal } = await client.get('/wallet/');
      setBalance(bal.balance);
      const { data: txs } = await client.get('/wallet/transactions');
      setTransactions(txs.transactions || []);
    } catch {}
  };

  useEffect(() => { loadData(); }, []);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    const phone = depositPhone.trim();
    if (!amount || amount <= 0) return Alert.alert('Error', 'Enter a valid amount');
    if (!phone) return Alert.alert('Error', 'Enter your EVC/Zaad phone number (e.g. +25261234567)');
    try {
      await client.post('/payments/initialize', { phone, amount });
      Alert.alert('Deposit Initiated', 'Complete payment on your phone');
      setDepositAmount('');
      setDepositPhone('');
      loadData();
    } catch (e) { Alert.alert('Error', e.response?.data?.error || 'Deposit failed'); }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return Alert.alert('Error', 'Enter a valid amount');
    if (amount < 1) return Alert.alert('Error', 'Minimum withdrawal is $1');
    if (amount > balance) return Alert.alert('Error', 'Insufficient balance');
    if (withdrawMethod === 'EVC' && !withdrawPhone.trim()) return Alert.alert('Error', 'Enter EVC phone number for withdrawal');
    setWithdrawing(true);
    try {
      const { data } = await client.post('/wallet/payout', {
        amount,
        method: withdrawMethod,
        accountInfo: withdrawMethod === 'EVC' ? { phone: withdrawPhone.trim() } : null,
      });
      Alert.alert('Withdrawal Submitted', `$${amount.toFixed(2)} withdrawal request is being processed.\nNew balance: $${(data.newBalance || 0).toFixed(2)}`);
      setWithdrawAmount('');
      setWithdrawPhone('');
      setShowWithdraw(false);
      loadData();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const txTypeLabel = (type) => {
    const labels = {
      RIDE_PAYMENT: '🛺 Ride Payment',
      DELIVERY_PAYMENT: '🍔 Delivery Payment',
      DEPOSIT: '💰 Deposit',
      WITHDRAWAL: '💸 Withdrawal',
      COMMISSION: '📊 Commission',
      REFUND: '↩️ Refund',
      BONUS: '🎁 Bonus',
      STORE_PAYMENT: '🏪 Store Payment',
    };
    return labels[type] || type?.replace(/_/g, ' ') || 'Transaction';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Wallet</Text>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceAmount}>${(balance || 0).toFixed(2)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Top Up via EVC/Zaad</Text>
      <View style={styles.depositSection}>
        <TextInput
          style={styles.input}
          placeholder="EVC/Zaad Phone (+252...)"
          placeholderTextColor={COLORS.textSecondary}
          value={depositPhone}
          onChangeText={setDepositPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
        <View style={styles.depositRow}>
          <TextInput
            style={styles.amountInput}
            placeholder="Amount ($)"
            placeholderTextColor={COLORS.textSecondary}
            value={depositAmount}
            onChangeText={setDepositAmount}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity style={styles.depositBtn} onPress={handleDeposit}>
            <Text style={styles.depositBtnText}>Top Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Withdraw Section */}
      <TouchableOpacity style={styles.withdrawToggle} onPress={() => setShowWithdraw(!showWithdraw)}>
        <Text style={styles.withdrawToggleText}>{showWithdraw ? '▼ Withdraw' : '▶ Withdraw'}</Text>
      </TouchableOpacity>

      {showWithdraw && (
        <View style={styles.depositSection}>
          <View style={styles.methodRow}>
            {['EVC', 'BANK'].map((m) => (
              <TouchableOpacity key={m} style={[styles.methodBtn, withdrawMethod === m && styles.methodBtnActive]} onPress={() => setWithdrawMethod(m)}>
                <Text style={[styles.methodBtnText, withdrawMethod === m && styles.methodBtnTextActive]}>{m === 'EVC' ? '📱 EVC' : '🏦 Bank'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {withdrawMethod === 'EVC' && (
            <TextInput
              style={styles.input}
              placeholder="EVC Phone (+252...)"
              placeholderTextColor={COLORS.textSecondary}
              value={withdrawPhone}
              onChangeText={setWithdrawPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          )}
          <View style={styles.depositRow}>
            <TextInput
              style={styles.amountInput}
              placeholder="Amount ($)"
              placeholderTextColor={COLORS.textSecondary}
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="decimal-pad"
            />
            <TouchableOpacity style={[styles.withdrawBtn, withdrawing && styles.withdrawBtnDisabled]} onPress={handleWithdraw} disabled={withdrawing}>
              {withdrawing ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.depositBtnText}>Withdraw</Text>}
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Min: $1 • Max: $10,000</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Transactions</Text>
      {transactions.map((tx) => (
        <View key={tx.id} style={styles.txRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.txType}>{txTypeLabel(tx.type)}</Text>
            {tx.description && <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>}
            <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
          </View>
          <Text style={[styles.txAmount, { color: tx.amount >= 0 ? COLORS.success : COLORS.danger }]}>
            {tx.amount >= 0 ? '+' : ''}{(tx.amount || 0).toFixed(2)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 16 },
  balanceCard: { backgroundColor: C.primary, borderRadius: 16, padding: 24, marginBottom: 20 },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  balanceAmount: { color: '#FFF', fontSize: 36, fontWeight: '800' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 12 },
  depositSection: { backgroundColor: C.card, borderRadius: 12, padding: 16, marginBottom: 24 },
  input: { backgroundColor: C.background, borderRadius: 10, padding: 14, color: C.text, fontSize: 16, marginBottom: 10 },
  depositRow: { flexDirection: 'row', gap: 10 },
  amountInput: { flex: 1, backgroundColor: C.background, borderRadius: 10, padding: 14, color: C.text, fontSize: 16 },
  depositBtn: { backgroundColor: C.primary, borderRadius: 10, paddingHorizontal: 24, justifyContent: 'center' },
  depositBtnText: { color: '#FFF', fontWeight: '700' },
  withdrawToggle: { marginBottom: 8, paddingVertical: 8 },
  withdrawToggleText: { color: C.primary, fontSize: 16, fontWeight: '700' },
  withdrawBtn: { backgroundColor: '#FF9500', borderRadius: 10, paddingHorizontal: 24, justifyContent: 'center' },
  withdrawBtnDisabled: { opacity: 0.6 },
  methodRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  methodBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: C.background, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  methodBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  methodBtnText: { color: C.textSecondary, fontWeight: '600', fontSize: 14 },
  methodBtnTextActive: { color: '#FFF' },
  hint: { color: C.textSecondary, fontSize: 12, marginTop: 6 },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  txType: { color: C.text, fontSize: 14, fontWeight: '500' },
  txDesc: { color: C.textSecondary, fontSize: 12, marginTop: 2 },
  txDate: { color: C.textSecondary, fontSize: 11, marginTop: 2 },
  txAmount: { fontWeight: '700', fontSize: 14 },
});
