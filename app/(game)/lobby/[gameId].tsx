import { Button } from '@/src/components/ui';
import { BORDER_RADIUS, COLORS, FONT_SIZE, MAX_PLAYERS, SPACING } from '@/src/constants';
import { startGame } from '@/src/features/game';
import { useGame } from '@/src/hooks';
import { useAuthStore, useGameStore } from '@/src/store';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LobbyScreen() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams<{ gameId?: string | string[] }>();
  const resolvedGameId = Array.isArray(gameId) ? gameId[0] : (gameId ?? null);

  const user = useAuthStore((state) => state.user);
  const game = useGameStore((state) => state.currentGame);

  const [isStartingGame, setIsStartingGame] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useGame(resolvedGameId, user?.uid ?? null);

  useEffect(() => {
    if (game?.status === 'playing' && resolvedGameId) {
      router.push(`/play/${resolvedGameId}`);
    }
  }, [game?.status, resolvedGameId, router]);

  const isHost = Boolean(user && game && user.uid === game.hostId);
  const players = game
    ? Object.values(game.players).sort((leftPlayer, rightPlayer) => {
        if (leftPlayer.isHost === rightPlayer.isHost) {
          return leftPlayer.displayName.localeCompare(rightPlayer.displayName);
        }

        return leftPlayer.isHost ? -1 : 1;
      })
    : [];
  const hostPlayer = players.find((player) => player.isHost) ?? null;
  const gameCode = game?.code ?? '----';
  const maxPlayers = game?.maxPlayers ?? MAX_PLAYERS;
  const connectedPlayers = players.length;
  const slots = Array.from({ length: maxPlayers }, (_, index) => players[index] ?? null);
  const isLoading = !game && !errorMessage;

  const handleStartGame = async () => {
    if (!resolvedGameId) {
      return;
    }

    setIsStartingGame(true);
    setErrorMessage('');

    try {
      await startGame(resolvedGameId);
    } catch {
      setErrorMessage('Impossible de lancer cette partie.');
    } finally {
      setIsStartingGame(false);
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          <Text style={styles.backLabel}>Retour</Text>
        </Pressable>

        <View style={styles.hero}>
          <View style={styles.logoStack}>
            <Text style={styles.logoTop}>APERO</Text>
            <Text style={styles.logoBottom}>BATTLE 🍺</Text>
          </View>

          <View style={styles.statusPill}>
            <Ionicons name="hourglass-outline" size={18} color={COLORS.text} />
            <Text style={styles.statusText}>Lobby {gameCode}</Text>
          </View>

          <Text style={styles.subtitle}>
            Patiente pendant que les autres joueurs rejoignent la partie.
          </Text>

          <View style={styles.card}>
            {isLoading ? (
              <View style={styles.feedbackState}>
                <ActivityIndicator size="large" color={COLORS.neonBlue} />
                <Text style={styles.feedbackTitle}>Connexion au lobby</Text>
                <Text style={styles.feedbackText}>
                  Récupération des informations de la partie...
                </Text>
              </View>
            ) : errorMessage ? (
              <View style={styles.feedbackState}>
                <Ionicons name="alert-circle-outline" size={36} color={COLORS.error} />
                <Text style={styles.feedbackTitle}>Partie indisponible</Text>
                <Text style={styles.feedbackText}>{errorMessage}</Text>
                <Button
                  label="Retour"
                  size="lg"
                  leftIcon={<Ionicons name="arrow-back-outline" size={22} color={COLORS.text} />}
                  onPress={() => router.back()}
                  style={styles.cta}
                />
              </View>
            ) : (
              <>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="people-outline" size={26} color={COLORS.text} />
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.cardTitle}>Salle d&apos;attente</Text>
                    <Text style={styles.cardText}>
                      La partie démarrera quand tout le monde sera là et que l&apos;hôte lancera
                      le jeu.
                    </Text>
                  </View>
                </View>

                <View style={styles.codeCard}>
                  <Text style={styles.sectionLabel}>Code de la partie</Text>
                  <Text style={styles.codeValue}>{gameCode}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Ionicons name="person-circle-outline" size={22} color={COLORS.neonBlue} />
                    <View>
                      <Text style={styles.summaryLabel}>Joueurs connectés</Text>
                      <Text style={styles.summaryValue}>
                        {connectedPlayers} / {maxPlayers}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.summaryItem}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={22}
                      color={COLORS.neonGreen}
                    />
                    <View>
                      <Text style={styles.summaryLabel}>Hôte</Text>
                      <Text style={styles.summaryValue}>
                        {hostPlayer?.displayName ?? 'Inconnu'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.playersSection}>
                  <Text style={styles.sectionLabel}>Joueurs dans le lobby</Text>

                  <View style={styles.playersGrid}>
                    {slots.map((player, index) =>
                      player ? (
                        <View key={player.uid} style={styles.playerCard}>
                          <View style={styles.avatar}>
                            <Text style={styles.avatarInitial}>
                              {player.displayName.charAt(0).toUpperCase()}
                            </Text>
                            {player.isHost ? (
                              <View style={styles.hostBadge}>
                                <Ionicons name="star" size={12} color={COLORS.background} />
                              </View>
                            ) : null}
                          </View>

                          <Text style={styles.playerName} numberOfLines={1}>
                            {player.displayName}
                          </Text>

                          <View style={styles.playerStatus}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.playerStatusText}>Connecté</Text>
                          </View>
                        </View>
                      ) : (
                        <View key={`empty-${index}`} style={styles.emptyCard}>
                          <View style={styles.emptyAvatar}>
                            <Ionicons
                              name="person-add-outline"
                              size={24}
                              color={COLORS.textMuted}
                            />
                          </View>
                          <Text style={styles.emptyTitle}>Place libre</Text>
                          <Text style={styles.emptyText}>En attente d&apos;un joueur</Text>
                        </View>
                      ),
                    )}
                  </View>
                </View>

                <View style={styles.notice}>
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color={COLORS.neonBlue}
                  />
                  <Text style={styles.noticeText}>
                    Une fois la partie lancée par l&apos;hôte, tous les joueurs passeront
                    automatiquement à l&apos;écran de jeu.
                  </Text>
                </View>

                <View style={styles.actions}>
                  {isHost ? (
                    <Button
                      label="Lancer la partie"
                      size="lg"
                      leftIcon={<Ionicons name="play-outline" size={22} color={COLORS.text} />}
                      onPress={handleStartGame}
                      isLoading={isStartingGame}
                      style={styles.cta}
                    />
                  ) : (
                    <View style={styles.waitingHost}>
                      <Ionicons name="hourglass-outline" size={20} color={COLORS.textSecondary} />
                      <Text style={styles.waitingHostText}>
                        En attente que l&apos;hôte lance la partie...
                      </Text>
                    </View>
                  )}
                  <Button
                    label="Quitter la partie"
                    variant="ghost"
                    size="md"
                    onPress={() => router.back()}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
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
    top: 178,
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
    top: 252,
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
    top: 214,
    left: 292,
    backgroundColor: '#FFD54A',
    transform: [{ rotate: '-22deg' }],
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
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  statusText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
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
    maxWidth: 400,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    gap: SPACING.lg,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(26, 26, 62, 0.84)',
    shadowColor: COLORS.neonBlue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  cardIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardHeaderText: {
    flex: 1,
    gap: SPACING.xs,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
  },
  cardText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
  },
  feedbackState: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  feedbackTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    textAlign: 'center',
  },
  feedbackText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
    textAlign: 'center',
  },
  codeCard: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.28)',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    gap: SPACING.sm,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  codeValue: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  playersSection: {
    gap: SPACING.md,
  },
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  playerCard: {
    width: '47%',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  avatar: {
    position: 'relative',
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    borderWidth: 2,
    borderColor: COLORS.neonBlue,
  },
  avatarInitial: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
  hostBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.secondary,
  },
  playerName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  playerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neonGreen,
  },
  playerStatusText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  emptyCard: {
    width: '47%',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  emptyAvatar: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.18)',
  },
  noticeText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
  actions: {
    gap: SPACING.sm,
  },
  waitingHost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  waitingHostText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    textAlign: 'center',
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
