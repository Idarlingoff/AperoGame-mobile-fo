import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../src/components/ui';
import { COLORS, FONT_SIZE, SPACING } from '../src/constants';
import { signOut } from '../src/services/firebase/auth';
import { useAuthStore } from '../src/store';

export default function SettingsScreen() {
  const { user, isAuthenticated } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>PARAMÈTRES</Text>

      {isAuthenticated && user ? (
        <>
          <Text style={styles.sectionLabel}>Profil</Text>
          <Text style={styles.info}>{user.displayName}</Text>
          <Text style={styles.info}>{user.email}</Text>
          <Button label="SE DÉCONNECTER" variant="outline" onPress={handleSignOut} style={styles.signOut} />
        </>
      ) : (
        <Button label="SE CONNECTER" onPress={() => router.push('/(auth)/login')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.xl, paddingTop: 60, gap: SPACING.md },
  back: { marginBottom: SPACING.sm },
  backText: { color: COLORS.text, fontSize: FONT_SIZE.lg },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.lg },
  sectionLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  info: { color: COLORS.text, fontSize: FONT_SIZE.md },
  signOut: { marginTop: SPACING.xl },
});