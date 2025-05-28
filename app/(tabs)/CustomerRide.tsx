// app/(tabs)/CustomerRide.tsx
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

const API_URL = 'http://172.23.48.1:8080/ride/request';

export default function CustomerRide() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [start, setStart] = useState('89 Bridge St,Walsall WS1 1JX, Regatul Unit');
  const [end, setEnd] = useState('Balls St,Walsall WS1 2HG, Regatul Unit');

  const sendRideRequest = () => {
    fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ start, end, type: 'economy'}),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((rideId) => {
        console.log('✅ Ride request sent. Ride ID:', rideId);
        Alert.alert('Success', `Ride requested! ID: ${rideId}`);
      })
      .catch((err) => {
        console.error('❌ Error sending ride request:', err);
        Alert.alert('Error', 'Failed to send ride request.');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🚕 Rider - Send Ride Request</Text>
      <TextInput
        placeholder="Start Address"
        value={start}
        onChangeText={setStart}
        style={styles.input}
      />
      <TextInput
        placeholder="End Address"
        value={end}
        onChangeText={setEnd}
        style={styles.input}
      />
      <Button title="Send Ride Request" onPress={sendRideRequest} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fafafa' },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
});
