import { Button } from '@/src/components/ui';
import { BORDER_RADIUS, COLORS, FONT_SIZE, SPACING } from '@/src/constants';
import { signOut } from '@/src/services/firebase';
import { useAuthStore } from '@/src/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatMemberSince = (createdAt: number) =>
  new Date(createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

export default function HubScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
      setIsAccountModalVisible(false);
      router.replace('/');
    } finally {
      setIsSigningOut(false);
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
        <View style={[styles.confetti, styles.confettiLilac]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>ESPACE JOUEUR</Text>
            <Text style={styles.headerTitle}>
              Salut {user?.displayName ?? 'joueur'}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            style={styles.accountButton}
            onPress={() => setIsAccountModalVisible(true)}
          >
            <Ionicons name="person-circle-outline" size={28} color={COLORS.text} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.logoStack}>
            <Text style={styles.logoTop}>APERO</Text>
            <Text style={styles.logoBottom}>BATTLE 🍺</Text>
          </View>

          <Text style={styles.subtitle}>Choisis comment tu veux lancer ta prochaine partie.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Que veux-tu faire ?</Text>
          <Text style={styles.cardText}>
            Crée une nouvelle table ou rejoins directement une partie existante.
          </Text>

          <View style={styles.actionCard}>
            <View style={styles.actionIconBlue}>
              <Ionicons name="add-circle-outline" size={26} color={COLORS.neonBlue} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Créer une partie</Text>
              <Text style={styles.actionText}>
                Configure le nombre de joueurs, le niveau et les mini-jeux.
              </Text>
            </View>
            <Button
              label="Créer"
              size="md"
              leftIcon={<Ionicons name="sparkles-outline" size={20} color={COLORS.text} />}
              onPress={() => router.push('/create')}
              style={styles.primaryAction}
            />
          </View>

          <View style={styles.actionCard}>
            <View style={styles.actionIconPink}>
              <Ionicons name="enter-outline" size={26} color={COLORS.neonPink} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Rejoindre une partie</Text>
              <Text style={styles.actionText}>
                Entre un code de salon pour retrouver rapidement la table de tes amis.
              </Text>
            </View>
            <Button
              label="Rejoindre"
              variant="outline"
              size="md"
              leftIcon={<Ionicons name="log-in-outline" size={20} color={COLORS.primary} />}
              onPress={() => router.push('/join')}
              style={styles.secondaryAction}
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={isAccountModalVisible}
        onRequestClose={() => setIsAccountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsAccountModalVisible(false)} />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mon compte</Text>
              <Pressable
                accessibilityRole="button"
                style={styles.modalCloseButton}
                onPress={() => setIsAccountModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={COLORS.text} />
              </Pressable>
            </View>

            <View style={styles.profileBadge}>
              <Text style={styles.profileInitial}>
                {user?.displayName.charAt(0).toUpperCase() ?? '?'}
              </Text>
            </View>

            <Text style={styles.profileName}>{user?.displayName ?? 'Joueur'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? 'Email indisponible'}</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Inscrit depuis</Text>
                <Text style={styles.infoValue}>
                  {user ? formatMemberSince(user.createdAt) : 'Inconnu'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Parties jouées</Text>
                <Text style={styles.infoValue}>{user?.stats.gamesPlayed ?? 0}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Victoires</Text>
                <Text style={styles.infoValue}>{user?.stats.wins ?? 0}</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                label="Fermer"
                variant="ghost"
                size="md"
                onPress={() => setIsAccountModalVisible(false)}
              />
              <Button
                label="Se déconnecter"
                variant="outline"
                size="md"
                leftIcon={<Ionicons name="log-out-outline" size={20} color={COLORS.primary} />}
                onPress={handleSignOut}
                isLoading={isSigningOut}
                style={styles.signOutButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    top: 220,
    right: -90,
    width: 260,
    height: 260,
    backgroundColor: 'rgba(0, 212, 255, 0.14)',
  },
  blurPurple: {
    bottom: -90,
    left: 24,
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
    top: 120,
    left: 30,
    backgroundColor: '#FF8B3D',
    transform: [{ rotate: '-36deg' }],
  },
  confettiPink: {
    top: 108,
    right: 62,
    backgroundColor: '#FF4D9D',
    transform: [{ rotate: '32deg' }],
  },
  confettiBlue: {
    top: 248,
    right: 26,
    backgroundColor: '#4A9FFF',
    transform: [{ rotate: '-18deg' }],
  },
  confettiTeal: {
    top: 78,
    left: 128,
    backgroundColor: '#37D6C6',
    transform: [{ rotate: '44deg' }],
  },
  confettiYellow: {
    top: 226,
    left: 278,
    backgroundColor: '#FFD54A',
    transform: [{ rotate: '-22deg' }],
  },
  confettiLilac: {
    top: 318,
    left: 52,
    backgroundColor: '#A56DFF',
    transform: [{ rotate: '14deg' }],
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
    gap: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerCopy: {
    gap: SPACING.xs,
    flexShrink: 1,
  },
  eyebrow: {
    color: COLORS.neonBlue,
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
  accountButton: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  hero: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingTop: SPACING.lg,
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
    maxWidth: 320,
  },
  card: {
    width: '100%',
    gap: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
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
  cardText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
    textAlign: 'center',
  },
  actionCard: {
    gap: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  actionIconBlue: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.24)',
  },
  actionIconPink: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 0, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.24)',
  },
  actionContent: {
    gap: SPACING.xs,
  },
  actionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
  },
  actionText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    lineHeight: 22,
  },
  primaryAction: {
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
  secondaryAction: {
    paddingVertical: SPACING.md,
    borderColor: COLORS.neonBlue,
    backgroundColor: 'rgba(0, 212, 255, 0.04)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(6, 6, 18, 0.72)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    gap: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(26, 26, 62, 0.96)',
    shadowColor: COLORS.neonBlue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  profileBadge: {
    alignSelf: 'center',
    width: 84,
    height: 84,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.35)',
  },
  profileInitial: {
    color: COLORS.text,
    fontSize: FONT_SIZE.display,
    fontWeight: '800',
  },
  profileName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    textAlign: 'center',
  },
  profileEmail: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
  },
  infoCard: {
    gap: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  infoValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  modalActions: {
    gap: SPACING.sm,
  },
  signOutButton: {
    borderColor: COLORS.primary,
  },
});
