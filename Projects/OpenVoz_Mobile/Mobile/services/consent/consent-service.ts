import { ApiError } from '../api';
import { consentApi } from '../api/consent-api';

export interface ConsentStatus {
  assessmentProcessing: boolean;
  aiImprovement: boolean;
  analytics: boolean;
  policyVersion: string;
}

type ConsentType = 'analytics' | 'ai_improvement';

interface MobileConsentResponse {
  assessment_processing: {
    granted: boolean;
    policy_version: string | null;
  };
  optional_consents: {
    analytics: {
      granted: boolean;
      policy_version: string | null;
    };
    ai_improvement: {
      granted: boolean;
      policy_version: string | null;
    };
  };
}

function normalizeConsent(payload: MobileConsentResponse): ConsentStatus {
  return {
    assessmentProcessing: Boolean(payload.assessment_processing?.granted),
    analytics: Boolean(payload.optional_consents?.analytics?.granted),
    aiImprovement: Boolean(payload.optional_consents?.ai_improvement?.granted),
    policyVersion:
      payload.assessment_processing?.policy_version ??
      payload.optional_consents?.analytics?.policy_version ??
      payload.optional_consents?.ai_improvement?.policy_version ??
      '',
  };
}

function buildPatchBody(consentType: ConsentType, granted: boolean) {
  return {
    [consentType]: granted,
  };
}

export const consentService = {
  async getConsent() {
    const response = await consentApi.getConsent();
    const payload = (await response.json()) as MobileConsentResponse;

    if (!payload.assessment_processing || !payload.optional_consents) {
      throw new ApiError('Consent response did not include a valid payload', {
        code: 'invalid_json',
        details: payload,
        status: response.status,
        url: response.url,
      });
    }

    return normalizeConsent(payload);
  },

  async updateConsent(consentType: ConsentType, granted: boolean) {
    const response = await consentApi.updateConsent(buildPatchBody(consentType, granted));
    const payload = (await response.json()) as MobileConsentResponse;

    if (!payload.assessment_processing || !payload.optional_consents) {
      throw new ApiError('Consent response did not include a valid payload', {
        code: 'invalid_json',
        details: payload,
        status: response.status,
        url: response.url,
      });
    }

    return normalizeConsent(payload);
  },
};
