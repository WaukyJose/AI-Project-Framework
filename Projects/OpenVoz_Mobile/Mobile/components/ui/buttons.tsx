import { Pressable, StyleSheet, Text } from 'react-native';

interface ButtonProps {
  accent?: string;
  disabled?: boolean;
  label: string;
  onPress?: () => void;
}

export function PrimaryButton({ accent, disabled = false, label, onPress }: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.base,
        styles.primary,
        accent ? { backgroundColor: accent } : null,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, styles.primaryText]}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ accent, disabled = false, label, onPress }: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.base,
        styles.secondary,
        accent ? { borderColor: accent } : null,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, styles.secondaryText, accent ? { color: accent } : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
  },
  disabled: {
    opacity: 0.55,
  },
  primary: {
    backgroundColor: '#0F4C5C',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BFD1DB',
    borderWidth: 1,
  },
  secondaryText: {
    color: '#102A43',
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
  },
});
