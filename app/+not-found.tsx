import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotFound() {
  const router = useRouter();
  return (
    <View>
      <Text>404 - Page Not Found</Text>
      <Button title="Go Home" onPress={() => router.push('/')} />
    </View>
  );
}
