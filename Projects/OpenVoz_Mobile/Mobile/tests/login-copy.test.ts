import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function read(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

describe('login copy', () => {
  it('uses production-facing EN and ES branding for the eyebrow', () => {
    const source = read('screens/auth/login-screen.tsx');

    expect(source).toContain("eyebrow: 'B2 Speaking Practice'");
    expect(source).toContain("eyebrow: 'Práctica de expresión oral B2'");
    expect(source).not.toContain('Sprint 2');
  });

  it('uses natural recovery wording without exposing a raw backend URL', () => {
    const source = read('screens/auth/login-screen.tsx');

    expect(source).toContain('Need to reset your password? Use the OpenVoz account recovery flow.');
    expect(source).toContain(
      '¿Necesitas restablecer tu contraseña? Usa el flujo de recuperación de cuenta de OpenVoz.',
    );
    expect(source).not.toContain('recovery URL is');
    expect(source).not.toContain('getPasswordResetUrl');
    expect(source).not.toContain('passwordResetUrl');
  });
});
