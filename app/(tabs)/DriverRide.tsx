// app/(tabs)/DriverRide.tsx
import { Client, IMessage } from '@stomp/stompjs';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import SockJS from 'sockjs-client';

const SOCKET_URL = 'http://172.23.48.1:8080/ws';

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

export default function DriverRide() {
  const { token, username } = useLocalSearchParams<{ token: string; username: string }>();
  const stompClient = useRef<Client | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<IncomingRideRequest | null>(null);

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
            console.log('📥 Received ride request:', payload);
            if (payload.rideId) setIncomingRequest(payload);
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

  const sendDriverResponse = (accepted: boolean) => {
    if (!incomingRequest) return;

    const response: RideResponse = {
      rideId: incomingRequest.rideId,
      driverId,
      accepted,
    };

    stompClient.current?.publish({
      destination: '/app/ride.response',
      body: JSON.stringify(response),
    });

    setIncomingRequest(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🧑‍✈️ Driver - Incoming Rides</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fafafa' },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});
