export const DELETION_REQUEST_STATUSES = ['requested', 'processing', 'completed', 'rejected'] as const;

export type DeletionRequestStatus = (typeof DELETION_REQUEST_STATUSES)[number];

export type DeletionRequestOutcome = {
  kind: 'success' | 'error';
  message: string;
};

const deletionRequestCopy = {
  en: {
    confirmation:
      'This starts permanent account deletion. It is not immediate. Account deletion requests are completed within 7 days. Once completed, your account will no longer be accessible.',
    completed:
      'Your account deletion has completed and your account is no longer accessible.',
    processing:
      'Your permanent account deletion is being processed. It is not immediate. Account deletion requests are completed within 7 days.',
    rejected:
      'Your deletion request was rejected and your account was not deleted.',
    requested:
      'Your deletion request was received. Deletion is not immediate. Account deletion requests are completed within 7 days.',
  },
  es: {
    confirmation:
      'Esto inicia la eliminación permanente de tu cuenta. No es inmediata. Las solicitudes de eliminación de cuenta se completan en un plazo de 7 días. Una vez completada, tu cuenta ya no estará accesible.',
    completed:
      'La eliminación de tu cuenta se completó y tu cuenta ya no está accesible.',
    processing:
      'La eliminación permanente de tu cuenta se está procesando. No es inmediata. Las solicitudes de eliminación de cuenta se completan en un plazo de 7 días.',
    rejected:
      'Tu solicitud de eliminación fue rechazada y tu cuenta no fue eliminada.',
    requested:
      'Tu solicitud de eliminación fue recibida. La eliminación no es inmediata. Las solicitudes de eliminación de cuenta se completan en un plazo de 7 días.',
  },
} as const;

export function getDeletionRequestConfirmationText(uiLanguage: keyof typeof deletionRequestCopy) {
  return deletionRequestCopy[uiLanguage].confirmation;
}

export function getDeletionRequestOutcome(
  uiLanguage: keyof typeof deletionRequestCopy,
  status: DeletionRequestStatus
): DeletionRequestOutcome {
  if (status === 'rejected') {
    return {
      kind: 'error',
      message: deletionRequestCopy[uiLanguage].rejected,
    };
  }

  return {
    kind: 'success',
    message:
      status === 'completed'
        ? deletionRequestCopy[uiLanguage].completed
        : status === 'processing'
          ? deletionRequestCopy[uiLanguage].processing
          : deletionRequestCopy[uiLanguage].requested,
  };
}
