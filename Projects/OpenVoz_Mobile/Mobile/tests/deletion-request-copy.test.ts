import {
  getDeletionRequestConfirmationText,
  getDeletionRequestOutcome,
} from '../screens/settings/deletion-request-copy';

describe('deletion request copy', () => {
  it.each([
    ['requested', 'Your deletion request was received. Deletion is not immediate. Account deletion requests are completed within 7 days.', 'success'],
    ['processing', 'Your permanent account deletion is being processed. It is not immediate. Account deletion requests are completed within 7 days.', 'success'],
    ['completed', 'Your account deletion has completed and your account is no longer accessible.', 'success'],
    ['rejected', 'Your deletion request was rejected and your account was not deleted.', 'error'],
  ] as const)('maps %s to the correct message and outcome', (status, message, kind) => {
    const outcome = getDeletionRequestOutcome('en', status);

    expect(outcome).toEqual({ kind, message });
  });

  it('treats rejected as a failure outcome rather than success', () => {
    expect(getDeletionRequestOutcome('en', 'rejected').kind).toBe('error');
  });

  it.each(['en', 'es'] as const)('does not promise tracking in %s confirmation text', (language) => {
    const confirmationText = getDeletionRequestConfirmationText(language);

    expect(confirmationText.toLowerCase()).not.toContain('track');
  });
});
