export type AssessmentStatusLanguage = 'en' | 'es';

const assessmentStatusLabels = {
  en: {
    completed: 'Completed',
    failed: 'Assessment unavailable',
    incomplete_evidence: 'Insufficient evidence',
    pending: 'Pending',
    processing: 'Processing',
  },
  es: {
    completed: 'Completado',
    failed: 'Evaluación no disponible',
    incomplete_evidence: 'Evidencia insuficiente',
    pending: 'Pendiente',
    processing: 'Procesando',
  },
} as const;

function humanizeStatus(value: string) {
  const normalized = value.trim().replace(/_/g, ' ').replace(/\s+/g, ' ');

  if (!normalized) {
    return null;
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function formatAssessmentStatusLabel(
  status: string | null | undefined,
  language: AssessmentStatusLanguage,
) {
  if (typeof status !== 'string') {
    return null;
  }

  const normalized = status.trim();
  if (!normalized) {
    return null;
  }

  const labels = assessmentStatusLabels[language];
  if (Object.prototype.hasOwnProperty.call(labels, normalized)) {
    return labels[normalized as keyof typeof labels];
  }

  return humanizeStatus(normalized);
}
