import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '../../src/components/ui';
import { BORDER_RADIUS, COLORS, FONT_SIZE, SPACING } from '../../src/constants';
import { signUp } from '../../src/services/firebase/auth';

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!displayName || !email || !password) return;
    setIsLoading(true);
    setError(null);
    try {
      await signUp(email, password, displayName);
      router.replace('/');
    } catch {
      setError('Erreur lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Pseudo"
        placeholderTextColor={COLORS.textMuted}
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={COLORS.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor={COLORS.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button label="S'INSCRIRE" isLoading={isLoading} onPress={handleRegister} />

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
    justifyContent: 'center',
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  input: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
  },
  link: {
    color: COLORS.primary,
    textAlign: 'center',
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.sm,
  },
});