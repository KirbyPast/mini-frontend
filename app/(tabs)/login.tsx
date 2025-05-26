import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

const API_URL = 'http://172.23.48.1:8080/auth/login';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Validation', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', `Welcome ${data.username} (${data.type})`);

        router.replace({
          pathname: '/(tabs)/RideWebSocket',
          params: {
            token: data.token,
            username: data.username,
            userType: data.type,
          },
        });
      } else {
        Alert.alert('Login Failed', data.error || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Unable to connect to server. Try again later.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 36,
    alignSelf: 'center',
    color: '#007AFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 20,
    fontSize: 16,
  },
});
