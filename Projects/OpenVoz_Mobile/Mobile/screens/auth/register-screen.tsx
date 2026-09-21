import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ScreenContainer } from '../../components/ui/screen-container';
import { useAuthStore } from '../../store/auth-store';
import { useUiPreferencesStore } from '../../store/ui-preferences-store';

interface RegistrationFields {
  confirmPassword: string;
  email: string;
  password: string;
  username: string;
}

function validateForm(fields: RegistrationFields) {
  const errors: Partial<Record<keyof RegistrationFields, string>> = {};

  if (!fields.username.trim()) {
    errors.username = 'Enter a username.';
  }

  if (!fields.email.trim()) {
    errors.email = 'Enter your email address.';
  }

  if (!fields.password.trim()) {
    errors.password = 'Enter a password.';
  }

  if (!fields.confirmPassword.trim()) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (fields.password !== fields.confirmPassword) {
    errors.confirmPassword = 'The passwords do not match.';
  }

  return errors;
}

const content = {
  en: {
    eyebrow: 'B2 Speaking Practice',
    title: 'Create your OpenVoz account',
    body: 'Start practicing with saved feedback, progress, and speaking history.',
    usernameLabel: 'Username',
    usernamePlaceholder: 'yourname',
    emailLabel: 'Email',
    emailPlaceholder: 'yourname@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Create a password',
    confirmPasswordLabel: 'Confirm password',
    confirmPasswordPlaceholder: 'Repeat your password',
    createAccount: 'Create Account',
    existingAccount: 'Already have an account?',
    signIn: 'Sign in',
  },
  es: {
    eyebrow: 'Práctica de expresión oral B2',
    title: 'Crea tu cuenta de OpenVoz',
    body: 'Empieza a practicar con comentarios, progreso e historial guardados.',
    usernameLabel: 'Usuario',
    usernamePlaceholder: 'tuusuario',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'tunombre@ejemplo.com',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: 'Crea una contraseña',
    confirmPasswordLabel: 'Confirmar contraseña',
    confirmPasswordPlaceholder: 'Repite tu contraseña',
    createAccount: 'Crear cuenta',
    existingAccount: '¿Ya tienes una cuenta?',
    signIn: 'Inicia sesión',
  },
} as const;

export function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const uiLanguage = useUiPreferencesStore((state) => state.uiLanguage);
  const t = content[uiLanguage];
  const [fields, setFields] = useState<RegistrationFields>({
    confirmPassword: '',
    email: '',
    password: '',
    username: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegistrationFields, string>>>(
    {}
  );

  function updateField(field: keyof RegistrationFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit() {
    const errors = validateForm(fields);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await register(fields);
    } catch {
      return;
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.eyebrow}>{t.eyebrow}</Text>
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.body}>{t.body}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>{t.usernameLabel}</Text>
            <TextInput
              accessibilityLabel={t.usernameLabel}
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect={false}
              editable={!isLoading}
              onChangeText={(value) => updateField('username', value)}
              placeholder={t.usernamePlaceholder}
              style={[styles.input, fieldErrors.username ? styles.inputError : null]}
              textContentType="username"
              value={fields.username}
            />
            {fieldErrors.username ? (
              <Text style={styles.fieldError}>{fieldErrors.username}</Text>
            ) : null}

            <Text style={styles.label}>{t.emailLabel}</Text>
            <TextInput
              accessibilityLabel={t.emailLabel}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              editable={!isLoading}
              inputMode="email"
              keyboardType="email-address"
              onChangeText={(value) => updateField('email', value)}
              placeholder={t.emailPlaceholder}
              style={[styles.input, fieldErrors.email ? styles.inputError : null]}
              textContentType="emailAddress"
              value={fields.email}
            />
            {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}

            <Text style={styles.label}>{t.passwordLabel}</Text>
            <TextInput
              accessibilityLabel={t.passwordLabel}
              autoComplete="new-password"
              editable={!isLoading}
              onChangeText={(value) => updateField('password', value)}
              placeholder={t.passwordPlaceholder}
              secureTextEntry
              style={[styles.input, fieldErrors.password ? styles.inputError : null]}
              textContentType="newPassword"
              value={fields.password}
            />
            {fieldErrors.password ? (
              <Text style={styles.fieldError}>{fieldErrors.password}</Text>
            ) : null}

            <Text style={styles.label}>{t.confirmPasswordLabel}</Text>
            <TextInput
              accessibilityLabel={t.confirmPasswordLabel}
              autoComplete="new-password"
              editable={!isLoading}
              onChangeText={(value) => updateField('confirmPassword', value)}
              placeholder={t.confirmPasswordPlaceholder}
              secureTextEntry
              style={[styles.input, fieldErrors.confirmPassword ? styles.inputError : null]}
              textContentType="newPassword"
              value={fields.confirmPassword}
            />
            {fieldErrors.confirmPassword ? (
              <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text>
            ) : null}

            {errorMessage ? (
              <View accessibilityRole="alert" style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Pressable
              accessibilityLabel={t.createAccount}
              accessibilityRole="button"
              disabled={isLoading}
              onPress={() => void handleSubmit()}
              style={[styles.button, isLoading ? styles.buttonDisabled : null]}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{t.createAccount}</Text>
              )}
            </Pressable>

            <View style={styles.signInPrompt}>
              <Text style={styles.supportText}>{t.existingAccount}</Text>
              <Pressable
                accessibilityLabel={t.signIn}
                accessibilityRole="button"
                disabled={isLoading}
                onPress={() => router.replace('/(auth)/login')}
                style={styles.linkButton}
              >
                <Text style={styles.metaText}>{t.signIn}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  buttonDisabled: {
    opacity: 0.7,
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
  keyboardAvoidingView: {
    flex: 1,
  },
  label: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  linkButton: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 4,
  },
  metaText: {
    color: '#0F4C5C',
    fontSize: 13,
    fontWeight: '600',
  },
  signInPrompt: {
    gap: 2,
    paddingTop: 6,
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
