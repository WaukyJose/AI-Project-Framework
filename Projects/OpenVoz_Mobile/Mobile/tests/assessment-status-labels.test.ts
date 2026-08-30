import { formatAssessmentStatusLabel } from '../services/assessment-status-labels';

describe('assessment status labels', () => {
  it.each([
    ['incomplete_evidence', 'en', 'Insufficient evidence'],
    ['incomplete_evidence', 'es', 'Evidencia insuficiente'],
    ['pending', 'en', 'Pending'],
    ['pending', 'es', 'Pendiente'],
    ['processing', 'en', 'Processing'],
    ['processing', 'es', 'Procesando'],
    ['completed', 'en', 'Completed'],
    ['completed', 'es', 'Completado'],
    ['failed', 'en', 'Assessment unavailable'],
    ['failed', 'es', 'Evaluación no disponible'],
  ] as const)('maps %s in %s', (status, language, expected) => {
    expect(formatAssessmentStatusLabel(status, language)).toBe(expected);
  });

  it('falls back safely for unknown values without exposing snake_case directly', () => {
    expect(formatAssessmentStatusLabel('needs_review', 'en')).toBe('Needs review');
    expect(formatAssessmentStatusLabel('needs_review', 'es')).toBe('Needs review');
    expect(formatAssessmentStatusLabel('', 'en')).toBeNull();
    expect(formatAssessmentStatusLabel(null, 'es')).toBeNull();
  });
});
