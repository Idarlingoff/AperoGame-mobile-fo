import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants';
import { MAX_LIVES } from '../../constants';
import type { Player } from '../../types';

interface PlayerCardProps {
  player: Player;
  isActive?: boolean;
}

export const PlayerCard = ({ player, isActive = false }: PlayerCardProps) => {
  return (
    <View style={[styles.container, isActive && styles.active]}>
      <View style={styles.avatarWrapper}>
        {player.photoURL ? (
          <Image source={{ uri: player.photoURL }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {player.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {player.isHost && <Text style={styles.crown}>👑</Text>}
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {player.displayName}
      </Text>

      <View style={styles.hearts}>
        {Array.from({ length: MAX_LIVES }).map((_, i) => (
          <Text key={i} style={styles.heart}>
            {i < player.lives ? '❤️' : '🖤'}
          </Text>
        ))}
      </View>

      <Text style={styles.score}>{player.score}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundCard,
    minWidth: 80,
    gap: SPACING.xs,
  },
  active: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.full,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  crown: {
    position: 'absolute',
    top: -8,
    right: -8,
    fontSize: 14,
  },
  name: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    maxWidth: 80,
    textAlign: 'center',
  },
  hearts: {
    flexDirection: 'row',
    gap: 2,
  },
  heart: {
    fontSize: 10,
  },
  score: {
    color: COLORS.neonBlue,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
});
