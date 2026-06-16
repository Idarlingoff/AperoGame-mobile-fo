import { BORDER_RADIUS, COLORS, FONT_SIZE, SPACING } from '@/src/constants';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Choice = 'rock' | 'paper' | 'scissors';

type Props = {
  durationSeconds: number;
  onFinish: (score: number) => void;
};

const CHOICES: { value: Choice; label: string; emoji: string }[] = [
  { value: 'rock', label: 'Pierre', emoji: '✊' },
  { value: 'paper', label: 'Feuille', emoji: '✋' },
  { value: 'scissors', label: 'Ciseaux', emoji: '✌️' },
];

export function ShiFuMiGame({ durationSeconds, onFinish }: Props) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const startedAtRef = useRef(Date.now());
  const calledRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  // Always report a result, even if the component unmounts before a choice.
  useEffect(
    () => () => {
      if (!calledRef.current) {
        calledRef.current = true;
        onFinishRef.current(0);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          clearInterval(timer);
          if (!calledRef.current) {
            calledRef.current = true;
            onFinish(0);
          }
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onFinish]);

  const handleChoice = (value: Choice) => {
    if (calledRef.current) return;
    calledRef.current = true;
    setChoice(value);
    const reactionMs = Date.now() - startedAtRef.current;
    onFinish(Math.max(0, durationSeconds * 1000 - reactionMs));
  };

  const selected = CHOICES.find((item) => item.value === choice);

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{timeLeft}s</Text>

      {selected ? (
        <View style={styles.result}>
          <Text style={styles.chosenEmoji}>{selected.emoji}</Text>
          <Text style={styles.chosenLabel}>{selected.label}</Text>
          <Text style={styles.waiting}>En attente des autres joueurs...</Text>
        </View>
      ) : (
        <View style={styles.choices}>
          {CHOICES.map((item) => (
            <Pressable
              key={item.value}
              style={styles.choiceButton}
              onPress={() => handleChoice(item.value)}
            >
              <Text style={styles.choiceEmoji}>{item.emoji}</Text>
              <Text style={styles.choiceLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  timer: {
    color: COLORS.neonBlue,
    fontSize: 40,
    fontWeight: '900',
  },
  choices: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  choiceButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  choiceEmoji: {
    fontSize: 40,
  },
  choiceLabel: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  result: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  chosenEmoji: {
    fontSize: 64,
  },
  chosenLabel: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
  waiting: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    textAlign: 'center',
  },
});
