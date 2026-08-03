import { Pressable, StyleSheet, Text } from 'react-native';

interface ButtonProps {
  disabled?: boolean;
  label: string;
  onPress?: () => void;
}

export function PrimaryButton({ disabled = false, label, onPress }: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.base, styles.primary, disabled && styles.disabled]}
    >
      <Text style={[styles.text, styles.primaryText]}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ disabled = false, label, onPress }: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.base, styles.secondary, disabled && styles.disabled]}
    >
      <Text style={[styles.text, styles.secondaryText]}>{label}</Text>
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
