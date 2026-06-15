import { Button } from '@/src/components/ui';
import { COLORS, FONT_SIZE, SPACING } from '@/src/constants';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apero Game</Text>
      <Button label="Connexion" size="lg" onPress={() => router.push('/login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.display,
    fontWeight: '800',
    textAlign: 'center',
  },
});
