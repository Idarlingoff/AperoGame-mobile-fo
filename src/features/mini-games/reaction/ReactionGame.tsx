import { BORDER_RADIUS, COLORS, FONT_SIZE, SPACING } from '@/src/constants';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  durationSeconds: number;
  onFinish: (score: number) => void;
};

type Phase = 'waiting' | 'ready' | 'done';

export function ReactionGame({ durationSeconds, onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>('waiting');
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const readyAtRef = useRef<number | null>(null);
  const calledRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  // Always report a result, even if the component unmounts before the player taps.
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
    const goGreenDelay = 1000 + Math.random() * 2000;
    const greenTimer = setTimeout(() => {
      readyAtRef.current = Date.now();
      setPhase('ready');
    }, goGreenDelay);

    const expiryTimer = setTimeout(() => {
      if (calledRef.current) return;
      calledRef.current = true;
      setPhase('done');
      onFinish(0);
    }, durationSeconds * 1000);

    return () => {
      clearTimeout(greenTimer);
      clearTimeout(expiryTimer);
    };
  }, [durationSeconds, onFinish]);

  const handleTap = () => {
    if (phase !== 'ready' || calledRef.current) return;
    calledRef.current = true;
    const elapsed = Date.now() - (readyAtRef.current ?? Date.now());
    setReactionMs(elapsed);
    setPhase('done');
    onFinish(Math.max(0, 1000 - elapsed));
  };

  const isReady = phase === 'ready';
  const isDone = phase === 'done';

  return (
    <Pressable
      style={[styles.container, isReady && styles.containerReady, isDone && styles.containerDone]}
      onPress={handleTap}
    >
      {isDone ? (
        <View style={styles.result}>
          <Text style={styles.resultLabel}>Ton temps</Text>
          <Text style={styles.resultValue}>
            {reactionMs !== null ? `${reactionMs} ms` : 'Trop lent !'}
          </Text>
        </View>
      ) : (
        <Text style={styles.instruction}>{isReady ? 'TAPE !' : 'Attends le vert...'}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#C0392B',
  },
  containerReady: {
    backgroundColor: '#27AE60',
  },
  containerDone: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  instruction: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: '900',
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  result: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  resultLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  resultValue: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: '900',
  },
});
