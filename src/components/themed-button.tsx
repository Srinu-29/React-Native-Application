import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';

interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

export function ThemedButton({ title, loading, style, ...rest }: ThemedButtonProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: theme.text },
        style
      ]}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={theme.background} />
      ) : (
        <ThemedText style={[styles.buttonText, { color: theme.background }]}>
          {title}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

