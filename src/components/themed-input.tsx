import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export function ThemedInput(props: TextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      style={[
        styles.input,
        { 
          borderColor: theme.backgroundSelected, 
          color: theme.text,
          backgroundColor: theme.backgroundElement
        },
        props.style
      ]}
      placeholderTextColor={theme.textSecondary}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
});