import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';

interface LoginHeaderProps {
  title: string;
  subtitle: string;
}

export function LoginHeader({ title, subtitle }: LoginHeaderProps) {
  return (
    <ThemedView style={styles.headerContainer}>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText type="default" style={styles.subtitle}>
        {subtitle}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: Spacing.six,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    marginBottom: Spacing.two,
  },
  subtitle: {
    opacity: 0.7,
  },
});

