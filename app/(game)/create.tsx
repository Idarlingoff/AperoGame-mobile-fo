import { Button } from '@/src/components/ui';
import {
  BORDER_RADIUS,
  COLORS,
  FONT_SIZE,
  GAGE_DRINKS_BY_LEVEL,
  MAX_PLAYERS,
  MINI_GAMES,
  MIN_PLAYERS,
  SPACING,
  TOTAL_TURNS,
} from '@/src/constants';
import { createGame } from '@/src/features/game';
import { useAuthStore } from '@/src/store';
import type { GageLevel, MiniGameId } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const miniGameOptions = Object.values(MINI_GAMES);
const defaultPlayerCount = Math.min(Math.max(3, MIN_PLAYERS), MAX_PLAYERS);
const defaultMiniGames = miniGameOptions.slice(0, 3).map((miniGame) => miniGame.id);
const playerOptions = Array.from(
  { length: MAX_PLAYERS - MIN_PLAYERS + 1 },
  (_, index) => MIN_PLAYERS + index,
);

const gageLevels: {
  accentColor: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: GageLevel;
}[] = [
  {
    value: 'soft',
    icon: 'happy-outline',
    description: 'Défis légers pour chauffer la table.',
    accentColor: COLORS.neonBlue,
  },
  {
    value: 'epice',
    icon: 'flame-outline',
    description: 'Le bon équilibre entre fun et pression.',
    accentColor: COLORS.primary,
  },
  {
    value: 'chaos',
    icon: 'thunderstorm-outline',
    description: 'Mode brutal pour les soirées sans filtre.',
    accentColor: COLORS.neonPink,
  },
];

const getGageLevelLabel = (value: GageLevel) => {
  if (value === 'soft') {
    return 'Soft';
  }

  if (value === 'epice') {
    return 'Épicé';
  }

  return 'Chaos';
};

export default function CreateGameScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [playerCount, setPlayerCount] = useState(defaultPlayerCount);
  const [gageLevel, setGageLevel] = useState<GageLevel>('epice');
  const [selectedMiniGames, setSelectedMiniGames] = useState<MiniGameId[]>(defaultMiniGames);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdjustPlayerCount = (direction: 'decrease' | 'increase') => {
    setPlayerCount((currentValue) => {
      if (direction === 'decrease') {
        return Math.max(MIN_PLAYERS, currentValue - 1);
      }

      return Math.min(MAX_PLAYERS, currentValue + 1);
    });
  };

  const handleToggleMiniGame = (miniGameId: MiniGameId) => {
    setSelectedMiniGames((currentValue) => {
      if (currentValue.includes(miniGameId)) {
        return currentValue.filter((item) => item !== miniGameId);
      }

      return [...currentValue, miniGameId];
    });
  };

  const handleCreateGame = async () => {
    setErrorMessage('');

    if (selectedMiniGames.length === 0) {
      setErrorMessage('Sélectionne au moins un mini-jeu pour lancer la partie.');
      return;
    }

    if (!user) {
      setErrorMessage('Tu dois être connecté pour créer une partie.');
      return;
    }

    setIsSubmitting(true);

    try {
      const gameId = await createGame({
        hostId: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        maxPlayers: playerCount,
        gageLevel,
        selectedMiniGames,
      });

      router.push(`/lobby/${gameId}`);
    } catch {
      setErrorMessage('La création de partie a échoué. Réessaie dans un instant.');
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

          <Text style={styles.subtitle}>Prépare la table avant de lancer les défis.</Text>

          <View style={styles.card}>
            <View style={styles.headerBlock}>
              <Text style={styles.cardTitle}>Nouvelle partie</Text>
              <Text style={styles.cardText}>
                Configure les joueurs, le niveau des gages et les mini-jeux avant d&apos;ouvrir
                le lobby.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Nombre de joueurs</Text>

              <View style={styles.stepperRow}>
                <Pressable
                  style={[
                    styles.stepperButton,
                    playerCount === MIN_PLAYERS && styles.stepperButtonDisabled,
                  ]}
                  onPress={() => handleAdjustPlayerCount('decrease')}
                  disabled={playerCount === MIN_PLAYERS}
                >
                  <Ionicons name="remove" size={20} color={COLORS.text} />
                </Pressable>

                <View style={styles.playerOptions}>
                  {playerOptions.map((option) => {
                    const isSelected = option === playerCount;

                    return (
                      <Pressable
                        key={option}
                        style={[styles.playerOption, isSelected && styles.playerOptionSelected]}
                        onPress={() => setPlayerCount(option)}
                      >
                        <Text
                          style={[
                            styles.playerOptionText,
                            isSelected && styles.playerOptionTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable
                  style={[
                    styles.stepperButton,
                    playerCount === MAX_PLAYERS && styles.stepperButtonDisabled,
                  ]}
                  onPress={() => handleAdjustPlayerCount('increase')}
                  disabled={playerCount === MAX_PLAYERS}
                >
                  <Ionicons name="add" size={20} color={COLORS.text} />
                </Pressable>
              </View>

              <Text style={styles.helperText}>
                Entre {MIN_PLAYERS} et {MAX_PLAYERS} joueurs.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Niveau des gages</Text>

              <View style={styles.levelGrid}>
                {gageLevels.map((level) => {
                  const isSelected = level.value === gageLevel;

                  return (
                    <Pressable
                      key={level.value}
                      style={[
                        styles.levelCard,
                        isSelected && {
                          borderColor: level.accentColor,
                          backgroundColor: 'rgba(255,255,255,0.08)',
                        },
                      ]}
                      onPress={() => setGageLevel(level.value)}
                    >
                      <View
                        style={[
                          styles.levelIcon,
                          isSelected && { backgroundColor: `${level.accentColor}22` },
                        ]}
                      >
                        <Ionicons
                          name={level.icon}
                          size={20}
                          color={isSelected ? level.accentColor : COLORS.textSecondary}
                        />
                      </View>
                      <Text style={styles.levelTitle}>{getGageLevelLabel(level.value)}</Text>
                      <Text style={styles.levelDescription}>{level.description}</Text>
                      <Text style={styles.levelDrinkInfo}>
                        +{GAGE_DRINKS_BY_LEVEL[level.value]} coup en cas de refus
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Mini-jeux</Text>

              <View style={styles.miniGameList}>
                {miniGameOptions.map((miniGame) => {
                  const isSelected = selectedMiniGames.includes(miniGame.id);

                  return (
                    <Pressable
                      key={miniGame.id}
                      style={[styles.miniGameItem, isSelected && styles.miniGameItemSelected]}
                      onPress={() => handleToggleMiniGame(miniGame.id)}
                    >
                      <View style={styles.miniGameMain}>
                        <View
                          style={[
                            styles.checkbox,
                            isSelected && styles.checkboxSelected,
                          ]}
                        >
                          {isSelected ? (
                            <Ionicons name="checkmark" size={16} color={COLORS.text} />
                          ) : null}
                        </View>

                        <View style={styles.miniGameTextBlock}>
                          <Text style={styles.miniGameTitle}>{miniGame.name}</Text>
                          <Text style={styles.miniGameDescription}>{miniGame.description}</Text>
                        </View>
                      </View>

                      <Text style={styles.miniGameDuration}>{miniGame.durationSeconds}s</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Ionicons name="people-outline" size={22} color={COLORS.neonBlue} />
                <Text style={styles.summaryLabel}>Joueurs</Text>
                <Text style={styles.summaryValue}>{playerCount}</Text>
              </View>

              <View style={styles.summaryCard}>
                <Ionicons name="game-controller-outline" size={22} color={COLORS.neonGreen} />
                <Text style={styles.summaryLabel}>Mini-jeux</Text>
                <Text style={styles.summaryValue}>{selectedMiniGames.length}</Text>
              </View>

              <View style={styles.summaryCard}>
                <Ionicons name="repeat-outline" size={22} color={COLORS.secondary} />
                <Text style={styles.summaryLabel}>Tours</Text>
                <Text style={styles.summaryValue}>{TOTAL_TURNS}</Text>
              </View>
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <View style={styles.actions}>
              <Button
                label="Créer la partie"
                size="lg"
                leftIcon={<Ionicons name="sparkles-outline" size={22} color={COLORS.text} />}
                onPress={handleCreateGame}
                disabled={selectedMiniGames.length === 0}
                isLoading={isSubmitting}
                style={styles.cta}
              />
              <Button
                label="Annuler"
                variant="ghost"
                size="md"
                onPress={() => router.back()}
              />
            </View>
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
    shadowColor: COLORS.neonPink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 12,
  },
  headerBlock: {
    gap: SPACING.xs,
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
  section: {
    gap: SPACING.md,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  stepperButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  stepperButtonDisabled: {
    opacity: 0.5,
  },
  playerOptions: {
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  playerOption: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  playerOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255, 107, 53, 0.18)',
  },
  playerOptionText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  playerOptionTextSelected: {
    color: COLORS.text,
  },
  helperText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
  },
  levelGrid: {
    gap: SPACING.sm,
  },
  levelCard: {
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  levelIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  levelTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  levelDescription: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
  levelDrinkInfo: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  miniGameList: {
    gap: SPACING.sm,
  },
  miniGameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  miniGameItemSelected: {
    borderColor: 'rgba(0, 212, 255, 0.35)',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
  },
  miniGameMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  checkboxSelected: {
    borderColor: COLORS.neonBlue,
    backgroundColor: COLORS.neonBlue,
  },
  miniGameTextBlock: {
    flex: 1,
    gap: 2,
  },
  miniGameTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  miniGameDescription: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
  miniGameDuration: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
  },
  errorText: {
    color: COLORS.error,
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
