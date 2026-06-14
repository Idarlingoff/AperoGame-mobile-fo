import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export const Button = ({
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  style,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], styles[size], (disabled || isLoading) && styles.disabled, style]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? COLORS.text : COLORS.primary} />
      ) : (
        <>
          {leftIcon}
          <Text style={[styles.label, styles[`label_${variant}`], styles[`label_${size}`]]}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.surface,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  sm: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md },
  md: { paddingVertical: SPACING.sm + 4, paddingHorizontal: SPACING.lg },
  lg: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl },
  label: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  label_primary: { color: COLORS.text },
  label_secondary: { color: COLORS.text },
  label_outline: { color: COLORS.primary },
  label_ghost: { color: COLORS.textSecondary },
  label_sm: { fontSize: FONT_SIZE.sm },
  label_md: { fontSize: FONT_SIZE.md },
  label_lg: { fontSize: FONT_SIZE.lg },
});
