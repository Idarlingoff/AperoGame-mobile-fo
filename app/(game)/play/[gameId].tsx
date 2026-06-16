import { Button } from '@/src/components/ui';
import {
  BORDER_RADIUS,
  COLORS,
  FONT_SIZE,
  MAX_LIVES,
  MINI_GAMES,
  SPACING,
} from '@/src/constants';
import { advanceGameTurn, getGameById, startGame } from '@/src/services/game';
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

export default function PlayScreen() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams<{ gameId?: string | string[] }>();
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdvancingTurn, setIsAdvancingTurn] = useState(false);
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

      const existingGame = await getGameById(resolvedGameId);

      if (!isMounted) {
        return;
      }

      if (!existingGame) {
        setGame(null);
        setErrorMessage('Cette partie est introuvable.');
        setIsLoading(false);
        return;
      }

      const playableGame =
        existingGame.currentTurn || existingGame.status === 'playing'
          ? existingGame
          : await startGame(existingGame.id);

      if (!isMounted) {
        return;
      }

      if (!playableGame) {
        setGame(null);
        setErrorMessage('Impossible de preparer cette partie.');
        setIsLoading(false);
        return;
      }

      setGame(playableGame);
      setIsLoading(false);
    };

    void loadGame();

    return () => {
      isMounted = false;
    };
  }, [resolvedGameId]);

  const orderedPlayers = game
    ? Object.values(game.players).sort((leftPlayer, rightPlayer) => {
        if (leftPlayer.isHost === rightPlayer.isHost) {
          return leftPlayer.displayName.localeCompare(rightPlayer.displayName);
        }

        return leftPlayer.isHost ? -1 : 1;
      })
    : [];
  const currentTurn = game?.currentTurn ?? null;
  const currentMiniGame = currentTurn ? MINI_GAMES[currentTurn.miniGameId] : null;
  const gageValidationCount = currentTurn ? Object.keys(currentTurn.gageValidations).length : 0;

  const handleNextTurn = async () => {
    if (!game) {
      return;
    }

    setIsAdvancingTurn(true);

    try {
      const nextGame = await advanceGameTurn(game.id);

      if (!nextGame) {
        setErrorMessage('Impossible de charger le tour suivant.');
        return;
      }

      setGame(nextGame);
    } finally {
      setIsAdvancingTurn(false);
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

          <View style={styles.turnPill}>
            <Text style={styles.turnPillText}>
              Tour {game?.currentTurnNumber ?? 0} / {game?.totalTurns ?? 0}
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.feedbackCard}>
              <ActivityIndicator size="large" color={COLORS.neonBlue} />
              <Text style={styles.feedbackTitle}>Chargement de la partie</Text>
              <Text style={styles.feedbackText}>Mise en place de l&apos;ecran de jeu...</Text>
            </View>
          ) : errorMessage || !game || !currentTurn || !currentMiniGame ? (
            <View style={styles.feedbackCard}>
              <Ionicons name="alert-circle-outline" size={36} color={COLORS.error} />
              <Text style={styles.feedbackTitle}>Partie indisponible</Text>
              <Text style={styles.feedbackText}>
                {errorMessage || 'Impossible d&apos;afficher le tour en cours.'}
              </Text>
              <Button
                label="Retour au lobby"
                size="lg"
                leftIcon={<Ionicons name="arrow-back-outline" size={22} color={COLORS.text} />}
                onPress={() => router.back()}
                style={styles.primaryButton}
              />
            </View>
          ) : (
            <>
              <View style={styles.gageCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="sparkles-outline" size={22} color={COLORS.neonPink} />
                  <Text style={styles.sectionTitle}>Gage du tour</Text>
                </View>

                <Text style={styles.gageText}>{currentTurn.gage.text}</Text>

                <View style={styles.gageMetaRow}>
                  <View style={styles.gageMetaCard}>
                    <Ionicons name="wine-outline" size={22} color={COLORS.text} />
                    <View style={styles.gageMetaTextBlock}>
                      <Text style={styles.gageMetaLabel}>Refuser</Text>
                      <Text style={styles.gageMetaValue}>
                        +{currentTurn.gage.drinksIfRefused} coup
                      </Text>
                    </View>
                  </View>

                  <View style={styles.gageMetaCard}>
                    <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.text} />
                    <View style={styles.gageMetaTextBlock}>
                      <Text style={styles.gageMetaLabel}>Validation</Text>
                      <Text style={styles.gageMetaValue}>
                        {gageValidationCount} / {orderedPlayers.length} joueurs
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.gameCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="game-controller-outline" size={22} color={COLORS.neonBlue} />
                  <Text style={styles.sectionTitleBlue}>Mini-jeu en cours</Text>
                </View>

                <Text style={styles.gameTitle}>{currentMiniGame.name}</Text>
                <Text style={styles.gameDescription}>{currentMiniGame.description}</Text>

                <View style={styles.placeholderArea}>
                  <View style={styles.placeholderBadge}>
                    <Ionicons name="construct-outline" size={20} color={COLORS.neonBlue} />
                  </View>
                  <Text style={styles.placeholderTitle}>Jeu a venir</Text>
                  <Text style={styles.placeholderText}>
                    La zone interactive du mini-jeu prendra place ici des que le gameplay sera
                    integre.
                  </Text>
                </View>

                <View style={styles.timerPill}>
                  <Text style={styles.timerValue}>{currentMiniGame.durationSeconds}</Text>
                  <Text style={styles.timerUnit}>sec</Text>
                </View>
              </View>

              <View style={styles.playersSection}>
                <Text style={styles.playersSectionTitle}>Joueurs dans la partie</Text>

                <View style={styles.playersGrid}>
                  {orderedPlayers.map((player) => (
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

                      <View style={styles.livesRow}>
                        {Array.from({ length: MAX_LIVES }).map((_, index) => (
                          <Ionicons
                            key={`${player.uid}-${index}`}
                            name={index < player.lives ? 'heart' : 'heart-outline'}
                            size={16}
                            color={index < player.lives ? COLORS.heart : COLORS.heartEmpty}
                          />
                        ))}
                      </View>

                      <Text style={styles.scoreValue}>{player.score}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.actions}>
                <Button
                  label="Lancer le prochain tour"
                  size="lg"
                  leftIcon={<Ionicons name="play-forward-outline" size={22} color={COLORS.text} />}
                  onPress={handleNextTurn}
                  isLoading={isAdvancingTurn}
                  disabled={game.currentTurnNumber >= game.totalTurns}
                  style={styles.primaryButton}
                />
                <Button
                  label="Retour au lobby"
                  variant="ghost"
                  size="md"
                  onPress={() => router.push(`/lobby/${game.id}`)}
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
  turnPill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  turnPillText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    textTransform: 'uppercase',
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
  gageCard: {
    width: '100%',
    maxWidth: 400,
    gap: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 157, 0.45)',
    backgroundColor: 'rgba(122, 21, 102, 0.30)',
    shadowColor: COLORS.neonPink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  sectionTitle: {
    color: '#FF76C8',
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  sectionTitleBlue: {
    color: COLORS.neonBlue,
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  gageText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    lineHeight: 42,
    textAlign: 'center',
  },
  gageMetaRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  gageMetaCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  gageMetaTextBlock: {
    flex: 1,
    gap: 2,
  },
  gageMetaLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  gageMetaValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  gameCard: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.35)',
    backgroundColor: 'rgba(15, 45, 120, 0.28)',
    shadowColor: COLORS.neonBlue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  gameTitle: {
    color: COLORS.text,
    fontSize: 44,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  gameDescription: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  placeholderArea: {
    width: '100%',
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderRadius: 28,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 212, 255, 0.30)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  placeholderBadge: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
  },
  placeholderTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    textAlign: 'center',
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 280,
  },
  timerPill: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 92,
    height: 92,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  timerValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
  },
  timerUnit: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  playersSection: {
    width: '100%',
    maxWidth: 400,
    gap: SPACING.md,
  },
  playersSectionTitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
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
  livesRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  scoreValue: {
    color: COLORS.neonBlue,
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
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
