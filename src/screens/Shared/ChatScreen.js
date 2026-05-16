import { useTheme } from '../../contexts/ThemeContext';

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOCKET_URL } from '../../config';

export default function ChatScreen({ route, navigation }) {
  const { colors: COLORS } = useTheme();
  const styles = createStyles(COLORS);
  const { rideId, riderName } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);
  const flatRef = useRef(null);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('ride:track', { rideId });
      });

      socket.on('chat:message', (msg) => {
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 50);
      });
    })();

    return () => { socketRef.current?.disconnect(); };
  }, [rideId]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const msg = { rideId, text, sender: 'driver', timestamp: new Date().toISOString() };
    socketRef.current?.emit('chat:message', msg);
    setMessages((prev) => [...prev, msg]);
    setInput('');
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const renderItem = ({ item }) => {
    const isMe = item.sender === 'driver';
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.text}</Text>
          <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No messages yet. Say hello to {riderName || 'rider'}!</Text>}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textSecondary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  list: { padding: 16, flexGrow: 1 },
  empty: { color: C.textSecondary, textAlign: 'center', marginTop: 40 },
  msgRow: { flexDirection: 'row', marginBottom: 12 },
  msgRowMe: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '75%', borderRadius: 16, padding: 12, backgroundColor: C.card },
  bubbleMe: { backgroundColor: C.primary },
  bubbleThem: { backgroundColor: C.card },
  bubbleText: { color: C.text, fontSize: 15 },
  bubbleTextMe: { color: '#FFF' },
  time: { color: C.textSecondary, fontSize: 10, marginTop: 4, textAlign: 'right' },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.card },
  input: { flex: 1, backgroundColor: C.background, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: C.text, fontSize: 15, marginRight: 8 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center' },
  sendText: { color: '#FFF', fontSize: 20 },
});
