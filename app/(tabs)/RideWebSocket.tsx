import { Client, IMessage } from '@stomp/stompjs';
import React, { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import SockJS from 'sockjs-client';

const SOCKET_URL = 'http://172.23.48.1:8080/ws';
const API_URL = 'http://172.23.48.1:8080/ride/request';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNzQ4Mjc0ODgzLCJleHAiOjE3NDgzNjEyODN9.ORoSS7Z-MGT1a99GORzh_BvQPtPwuHDSNpmj5Ul5JeQ'; // Shortened

type IncomingRideRequest = {
  rideId: string;
  start: string;
  end: string;
};

type RideResponse = {
  rideId: string;
  driverId: string;
  accepted: boolean;
};

export default function RideWebSocket() {
  const stompClient = useRef<Client | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<IncomingRideRequest | null>(null);

  const [start, setStart] = useState('89 Bridge St,Walsall WS1 1JX, Regatul Unit');
  const [end, setEnd] = useState('Balls St,Walsall WS1 2HG, Regatul Unit');

  const driverId = '639597134436051';

  useEffect(() => {


    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      debug: (str) => console.log('[STOMP]', str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ WebSocket connected');

        client.subscribe(`/topic/public/${driverId}`, (message: IMessage) => {
          try {
            const payload = JSON.parse(message.body);
            console.log('📥 Received ride request payload:', payload);

            if (payload.rideId && payload.start && payload.end) {
              setIncomingRequest(payload);
            } else {
              console.warn('⚠️ Malformed ride request:', payload);
            }
          } catch (err) {
            console.error('❌ Error parsing ride request:', err);
          }
        });
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame.headers['message']);
        console.error(frame.body);
      },
    });

    stompClient.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  const sendRideRequest = () => {
    fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ start, end }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((rideId) => {
        console.log('✅ Ride request sent. Ride ID:', rideId);
        alert(`Ride requested! ID: ${rideId}`);
      })
      .catch((err) => {
        console.error('❌ Error sending ride request:', err);
        alert('Failed to send ride request.');
      });
  };

  const sendDriverResponse = (accepted: boolean) => {
    if (!incomingRequest) return;

    const response: RideResponse = {
      rideId: incomingRequest.rideId,
      driverId,
      accepted,
    };

    console.log('📤 Sending driver response:', response);

    stompClient.current?.publish({
      destination: '/app/ride.response',
      body: JSON.stringify(response),
    });

    setIncomingRequest(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🧑‍💻 Ride WebSocket Panel</Text>

      {/* Rider Section */}
      <View style={styles.section}>
        <Text style={styles.subHeader}>🚕 Rider - Send Ride Request</Text>
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

      {/* Driver Section */}
      <View style={styles.section}>
        <Text style={styles.subHeader}>🧑‍✈️ Driver - Incoming Ride</Text>
        {incomingRequest ? (
          <View>
            <Text>Ride ID: {incomingRequest.rideId}</Text>
            <Text>From: {incomingRequest.start}</Text>
            <Text>To: {incomingRequest.end}</Text>
            <View style={styles.buttonGroup}>
              <Button title="Accept" onPress={() => sendDriverResponse(true)} />
              <Button title="Reject" color="red" onPress={() => sendDriverResponse(false)} />
            </View>
          </View>
        ) : (
          <Text>No active ride requests</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  section: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});
