import { Button } from '@/src/components/ui';
import { BORDER_RADIUS, COLORS, FONT_SIZE, SPACING } from '@/src/constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

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
        <View style={[styles.confetti, styles.confettiLilac]} />
      </View>
      <View style={styles.hero}>
        <View style={styles.logoStack}>
          <Text style={styles.logoTop}>APERO</Text>
          <Text style={styles.logoBottom}>BATTLE 🍺</Text>
        </View>

        <Text style={styles.subtitle}>Le jeu qui ruine les réputations</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Es-tu prêt à relever les défis ?</Text>
          <View style={styles.actions}>
            <Button
              label="Connexion"
              size="lg"
              leftIcon={<Ionicons name="log-in-outline" size={22} color={COLORS.text} />}
              onPress={() => router.push('/login')}
              style={styles.cta}
            />
            <Button
              label="Créer un compte"
              variant="outline"
              size="lg"
              leftIcon={<Ionicons name="person-add-outline" size={22} color={COLORS.primary} />}
              onPress={() => router.push('/register')}
              style={styles.secondaryCta}
            />
          </View>
        </View>
      </View>

      <View style={styles.bottomBadge}>
        <Text style={styles.bottomEmoji}>🥂</Text>
      </View>
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
    top: -80,
    left: -60,
    width: 220,
    height: 220,
    backgroundColor: 'rgba(255, 0, 255, 0.18)',
  },
  blurBlue: {
    right: -70,
    top: 140,
    width: 240,
    height: 240,
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
  },
  blurPurple: {
    bottom: -90,
    left: 40,
    width: 280,
    height: 280,
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
    top: 158,
    left: 40,
    backgroundColor: '#FF8B3D',
    transform: [{ rotate: '-36deg' }],
  },
  confettiPink: {
    top: 120,
    right: 56,
    backgroundColor: '#FF4D9D',
    transform: [{ rotate: '32deg' }],
  },
  confettiBlue: {
    top: 220,
    right: 28,
    backgroundColor: '#4A9FFF',
    transform: [{ rotate: '-18deg' }],
  },
  confettiTeal: {
    top: 92,
    left: 110,
    backgroundColor: '#37D6C6',
    transform: [{ rotate: '44deg' }],
  },
  confettiYellow: {
    top: 170,
    left: 300,
    backgroundColor: '#FFD54A',
    transform: [{ rotate: '-22deg' }],
  },
  confettiLilac: {
    top: 70,
    right: 140,
    backgroundColor: '#A56DFF',
    transform: [{ rotate: '28deg' }],
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.lg,
  },
  logoStack: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  logoTop: {
    color: COLORS.text,
    fontSize: FONT_SIZE.display,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(165, 109, 255, 0.7)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 18,
  },
  logoBottom: {
    color: '#FFB423',
    fontSize: 44,
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
    maxWidth: 280,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    gap: SPACING.md,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(26, 26, 62, 0.82)',
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
    lineHeight: 38,
  },
  actions: {
    gap: SPACING.md,
  },
  cta: {
    marginTop: SPACING.sm,
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
  secondaryCta: {
    paddingVertical: SPACING.md,
    borderColor: COLORS.neonBlue,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  bottomBadge: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  bottomEmoji: {
    fontSize: 46,
  },
});
