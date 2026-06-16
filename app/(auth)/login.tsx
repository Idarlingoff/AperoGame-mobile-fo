import { Button } from '@/src/components/ui';
import { BORDER_RADIUS, COLORS, FONT_SIZE, SPACING } from '@/src/constants';
import { signIn } from '@/src/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Une erreur est survenue pendant la connexion.';
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    const trimmedEmail = email.trim();

    setErrorMessage('');
    setSuccessMessage('');

    if (!trimmedEmail || !password) {
      setErrorMessage('Renseigne ton email et ton mot de passe.');
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn(trimmedEmail, password);
      setSuccessMessage('Connexion réussie.');
      setPassword('');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.background}>
        <View style={[styles.blur, styles.blurPink]} />
        <View style={[styles.blur, styles.blurBlue]} />
        <View style={[styles.blur, styles.blurPurple]} />

        <View style={[styles.confetti, styles.confettiOrange]} />
        <View style={[styles.confetti, styles.confettiPink]} />
        <View style={[styles.confetti, styles.confettiBlue]} />
        <View style={[styles.confetti, styles.confettiTeal]} />
        <View style={[styles.confetti, styles.confettiYellow]} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            <Text style={styles.backLabel}>Retour</Text>
          </Pressable>

          <View style={styles.hero}>
            <View style={styles.logoStack}>
              <Text style={styles.logoTop}>APERO</Text>
              <Text style={styles.logoBottom}>BATTLE 🍺</Text>
            </View>

            <Text style={styles.subtitle}>Connecte-toi pour retrouver ta soirée.</Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Connexion</Text>

              <View style={styles.fields}>
                <View style={styles.field}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="ton@email.com"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Mot de passe</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Ton mot de passe"
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                  />
                </View>
              </View>

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
              {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

              <View style={styles.actions}>
                <Button
                  label="Se connecter"
                  size="lg"
                  leftIcon={<Ionicons name="log-in-outline" size={22} color={COLORS.text} />}
                  onPress={handleSignIn}
                  isLoading={isSubmitting}
                  style={styles.cta}
                />
                <Button
                  label="Créer un compte"
                  variant="ghost"
                  size="md"
                  onPress={() => router.push('/register')}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blur: {
    position: 'absolute',
    borderRadius: BORDER_RADIUS.full,
  },
  blurPink: {
    top: -90,
    left: -70,
    width: 240,
    height: 240,
    backgroundColor: 'rgba(255, 0, 255, 0.18)',
  },
  blurBlue: {
    top: 180,
    right: -90,
    width: 260,
    height: 260,
    backgroundColor: 'rgba(0, 212, 255, 0.14)',
  },
  blurPurple: {
    bottom: -100,
    left: 30,
    width: 300,
    height: 300,
    backgroundColor: 'rgba(138, 92, 255, 0.18)',
  },
  confetti: {
    position: 'absolute',
    width: 18,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    opacity: 0.9,
  },
  confettiOrange: {
    top: 180,
    left: 34,
    backgroundColor: '#FF8B3D',
    transform: [{ rotate: '-36deg' }],
  },
  confettiPink: {
    top: 116,
    right: 52,
    backgroundColor: '#FF4D9D',
    transform: [{ rotate: '32deg' }],
  },
  confettiBlue: {
    top: 254,
    right: 28,
    backgroundColor: '#4A9FFF',
    transform: [{ rotate: '-18deg' }],
  },
  confettiTeal: {
    top: 88,
    left: 118,
    backgroundColor: '#37D6C6',
    transform: [{ rotate: '44deg' }],
  },
  confettiYellow: {
    top: 210,
    left: 292,
    backgroundColor: '#FFD54A',
    transform: [{ rotate: '-22deg' }],
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  backLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  logoStack: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  logoTop: {
    color: COLORS.text,
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(165, 109, 255, 0.7)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 18,
  },
  logoBottom: {
    color: '#FFB423',
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(255, 0, 255, 0.4)',
    textShadowOffset: { width: 0, height: 5 },
    textShadowRadius: 14,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 300,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    gap: SPACING.lg,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(26, 26, 62, 0.84)',
    shadowColor: COLORS.neonPink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 12,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    textAlign: 'center',
  },
  fields: {
    gap: SPACING.md,
  },
  field: {
    gap: SPACING.xs,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  input: {
    minHeight: 56,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
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
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
  successText: {
    color: COLORS.success,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
  actions: {
    gap: SPACING.sm,
  },
  cta: {
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.35)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
});
