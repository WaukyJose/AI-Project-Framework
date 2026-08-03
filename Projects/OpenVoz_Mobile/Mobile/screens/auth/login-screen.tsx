import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ScreenContainer } from '../../components/ui/screen-container';
import { authService } from '../../services/auth/auth-service';
import { useAuthStore } from '../../store/auth-store';

function validateForm(username: string, password: string) {
  const errors: { password?: string; username?: string } = {};

  if (!username.trim()) {
    errors.username = 'Enter your username or email.';
  }

  if (!password.trim()) {
    errors.password = 'Enter your password.';
  }

  return errors;
}

export function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; username?: string }>({});
  const passwordResetUrl = authService.getPasswordResetUrl();

  async function handleSubmit() {
    const errors = validateForm(username, password);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await login({
        password,
        username,
      });
    } catch {
      return;
    }
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Sprint 2</Text>
          <Text style={styles.title}>Sign in to OpenVoz</Text>
          <Text style={styles.body}>
            Authentication remains server-owned. The mobile client reuses the existing OpenVoz
            sign-in flow and persists only the session metadata required for continuity.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Username or email</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            onChangeText={setUsername}
            placeholder="yourname@example.com"
            style={[styles.input, fieldErrors.username ? styles.inputError : null]}
            value={username}
          />
          {fieldErrors.username ? (
            <Text style={styles.fieldError}>{fieldErrors.username}</Text>
          ) : null}

          <Text style={styles.label}>Password</Text>
          <TextInput
            editable={!isLoading}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            style={[styles.input, fieldErrors.password ? styles.inputError : null]}
            value={password}
          />
          {fieldErrors.password ? (
            <Text style={styles.fieldError}>{fieldErrors.password}</Text>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Pressable disabled={isLoading} onPress={() => void handleSubmit()} style={styles.button}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </Pressable>

          <Pressable disabled style={styles.linkButton}>
            <Text style={styles.metaText}>Forgot Password</Text>
          </Pressable>
          <Text style={styles.supportText}>
            Password recovery remains owned by the OpenVoz account system. The current backend
            recovery URL is {passwordResetUrl}.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    color: '#334155',
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#0F4C5C',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 20,
  },
  content: {
    flexGrow: 1,
    gap: 20,
    justifyContent: 'center',
    paddingBottom: 32,
  },
  eyebrow: {
    color: '#0F4C5C',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    lineHeight: 21,
  },
  fieldError: {
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 18,
    marginTop: -4,
  },
  header: {
    gap: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 14,
    borderWidth: 1,
    color: '#0F172A',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: '#F87171',
  },
  linkButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  label: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  metaText: {
    color: '#0F4C5C',
    fontSize: 13,
    fontWeight: '600',
  },
  supportText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
  },
  title: {
    color: '#0F172A',
    fontSize: 32,
    fontWeight: '800',
  },
});
