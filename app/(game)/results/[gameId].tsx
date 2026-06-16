import { Button } from '@/src/components/ui';
import { BORDER_RADIUS, COLORS, FONT_SIZE, MAX_LIVES, SPACING } from '@/src/constants';
import { getGameById } from '@/src/services/game';
import type { Game } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function ResultsScreen() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams<{ gameId?: string | string[] }>();
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const resolvedGameId = Array.isArray(gameId) ? gameId[0] : gameId;

  useEffect(() => {
    let isMounted = true;

    const loadGame = async () => {
      if (!resolvedGameId) {
        if (isMounted) {
          setErrorMessage('Impossible de retrouver cette partie.');
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      const nextGame = await getGameById(resolvedGameId);

      if (!isMounted) {
        return;
      }

      if (!nextGame) {
        setGame(null);
        setErrorMessage('Cette partie est introuvable.');
        setIsLoading(false);
        return;
      }

      setGame(nextGame);
      setIsLoading(false);
    };

    void loadGame();

    return () => {
      isMounted = false;
    };
  }, [resolvedGameId]);

  const rankedPlayers = game
    ? Object.values(game.players).sort((leftPlayer, rightPlayer) => {
        if (rightPlayer.score !== leftPlayer.score) {
          return rightPlayer.score - leftPlayer.score;
        }

        if (rightPlayer.lives !== leftPlayer.lives) {
          return rightPlayer.lives - leftPlayer.lives;
        }

        return leftPlayer.displayName.localeCompare(rightPlayer.displayName);
      })
    : [];
  const winner = rankedPlayers[0] ?? null;
  const secondPlayer = rankedPlayers[1] ?? null;
  const thirdPlayer = rankedPlayers[2] ?? null;
  const totalDrinks = rankedPlayers.reduce((total, player) => total + player.drinksCount, 0);
  const totalLivesLeft = rankedPlayers.reduce((total, player) => total + player.lives, 0);
  const isFinished = game?.status === 'finished';

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
            <Ionicons
              name={isFinished ? 'trophy-outline' : 'stats-chart-outline'}
              size={18}
              color={COLORS.text}
            />
            <Text style={styles.statusText}>
              {isFinished ? 'Fin de partie' : 'Classement provisoire'}
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.feedbackCard}>
              <ActivityIndicator size="large" color={COLORS.neonBlue} />
              <Text style={styles.feedbackTitle}>Chargement du classement</Text>
              <Text style={styles.feedbackText}>Préparation des scores de fin de partie...</Text>
            </View>
          ) : errorMessage || !game || rankedPlayers.length === 0 ? (
            <View style={styles.feedbackCard}>
              <Ionicons name="alert-circle-outline" size={36} color={COLORS.error} />
              <Text style={styles.feedbackTitle}>Résultats indisponibles</Text>
              <Text style={styles.feedbackText}>
                {errorMessage || "Impossible d'afficher le classement de cette partie."}
              </Text>
              <Button
                label="Retour"
                size="lg"
                leftIcon={<Ionicons name="arrow-back-outline" size={22} color={COLORS.text} />}
                onPress={() => router.back()}
                style={styles.primaryButton}
              />
            </View>
          ) : (
            <>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>
                  {isFinished ? 'Classement final' : 'Aperçu du classement'}
                </Text>
                <Text style={styles.summaryText}>
                  {isFinished
                    ? 'La partie est terminée. Voici le classement de la table.'
                    : "La partie n'est pas encore terminée, mais tu peux déjà visualiser les scores."}
                </Text>
              </View>

              {winner ? (
                <View style={styles.winnerCard}>
                  <View style={styles.winnerBadge}>
                    <Ionicons name="trophy" size={28} color={COLORS.background} />
                  </View>
                  <Text style={styles.winnerRank}>#1</Text>
                  <Text style={styles.winnerName}>{winner.displayName}</Text>
                  <Text style={styles.winnerScore}>{winner.score} pts</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaCard}>
                      <Ionicons name="heart" size={18} color={COLORS.heart} />
                      <Text style={styles.metaValue}>{winner.lives}</Text>
                    </View>
                    <View style={styles.metaCard}>
                      <Ionicons name="wine-outline" size={18} color={COLORS.secondary} />
                      <Text style={styles.metaValue}>{winner.drinksCount}</Text>
                    </View>
                  </View>
                </View>
              ) : null}

              {(secondPlayer || thirdPlayer) ? (
                <View style={styles.podiumRow}>
                  {[secondPlayer, thirdPlayer].map((player, index) =>
                    player ? (
                      <View key={player.uid} style={styles.podiumCard}>
                        <Text style={styles.podiumRank}>#{index + 2}</Text>
                        <Text style={styles.podiumName}>{player.displayName}</Text>
                        <Text style={styles.podiumScore}>{player.score} pts</Text>
                      </View>
                    ) : null,
                  )}
                </View>
              ) : null}

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Ionicons name="repeat-outline" size={22} color={COLORS.neonBlue} />
                  <Text style={styles.statLabel}>Tours joués</Text>
                  <Text style={styles.statValue}>{game.currentTurnNumber}</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="game-controller-outline" size={22} color={COLORS.neonGreen} />
                  <Text style={styles.statLabel}>Mini-jeux</Text>
                  <Text style={styles.statValue}>{game.selectedMiniGames.length}</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="flame-outline" size={22} color={COLORS.secondary} />
                  <Text style={styles.statLabel}>Niveau</Text>
                  <Text style={styles.statValue}>{game.gageLevel}</Text>
                </View>
              </View>

              <View style={styles.listCard}>
                <Text style={styles.sectionTitle}>Classement complet</Text>

                <View style={styles.list}>
                  {rankedPlayers.map((player, index) => (
                    <View key={player.uid} style={styles.listItem}>
                      <View style={styles.listRank}>
                        <Text style={styles.listRankText}>{index + 1}</Text>
                      </View>

                      <View style={styles.listBody}>
                        <Text style={styles.listName}>{player.displayName}</Text>
                        <View style={styles.livesRow}>
                          {Array.from({ length: MAX_LIVES }).map((_, heartIndex) => (
                            <Ionicons
                              key={`${player.uid}-${heartIndex}`}
                              name={heartIndex < player.lives ? 'heart' : 'heart-outline'}
                              size={14}
                              color={heartIndex < player.lives ? COLORS.heart : COLORS.heartEmpty}
                            />
                          ))}
                        </View>
                      </View>

                      <View style={styles.listMetrics}>
                        <Text style={styles.listScore}>{player.score}</Text>
                        <Text style={styles.listDrinks}>{player.drinksCount} coups</Text>
                      </View>
                    </View>
                  ))}

                </View>
              </View>

              <View style={styles.recapsRow}>
                <View style={styles.recapCard}>
                  <Text style={styles.recapLabel}>Coups distribués</Text>
                  <Text style={styles.recapValue}>{totalDrinks}</Text>
                </View>

                <View style={styles.recapCard}>
                  <Text style={styles.recapLabel}>Vies restantes</Text>
                  <Text style={styles.recapValue}>{totalLivesLeft}</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <Button
                  label="Nouvelle partie"
                  size="lg"
                  leftIcon={<Ionicons name="sparkles-outline" size={22} color={COLORS.text} />}
                  onPress={() => router.push('/create')}
                  style={styles.primaryButton}
                />
                <Button
                  label={isFinished ? "Retour à l'accueil" : 'Retour au jeu'}
                  variant="ghost"
                  size="md"
                  onPress={() => router.push(isFinished ? '/' : `/play/${game.id}`)}
                />
              </View>
            </>
          )}
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
  feedbackCard: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(26, 26, 62, 0.84)',
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
  summaryCard: {
    width: '100%',
    maxWidth: 400,
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(26, 26, 62, 0.84)',
  },
  summaryTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    textAlign: 'center',
  },
  summaryText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
    textAlign: 'center',
  },
  winnerCard: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.34)',
    backgroundColor: 'rgba(255, 190, 60, 0.14)',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 12,
  },
  winnerBadge: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.secondary,
  },
  winnerRank: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  winnerName: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  winnerScore: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  metaValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  podiumRow: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    gap: SPACING.md,
  },
  podiumCard: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  podiumRank: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  podiumName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
  podiumScore: {
    color: COLORS.neonBlue,
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  statsRow: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  listCard: {
    width: '100%',
    maxWidth: 400,
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(26, 26, 62, 0.84)',
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    textAlign: 'center',
  },
  list: {
    gap: SPACING.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  listRank: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  listRankText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
  listBody: {
    flex: 1,
    gap: 4,
  },
  listName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  livesRow: {
    flexDirection: 'row',
    gap: 4,
  },
  listMetrics: {
    alignItems: 'flex-end',
    gap: 2,
  },
  listScore: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
  },
  listDrinks: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  recapsRow: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    gap: SPACING.md,
  },
  recapCard: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  recapLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  recapValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
  actions: {
    width: '100%',
    maxWidth: 400,
    gap: SPACING.sm,
  },
  primaryButton: {
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
