import { ApiEnvironmentName } from '../../utils/env';
import { ApiError } from '../api';
import { profileApi } from '../api/profile-api';
import { AuthUser } from '../../types/auth';

interface MobileProfileResponse {
  email: string;
  first_name: string;
  full_name: string;
  id: number;
  last_name: string;
  username: string;
}

function normalizeProfile(profile: MobileProfileResponse): AuthUser {
  return {
    displayName: profile.full_name || profile.username,
    email: profile.email || null,
    firstName: profile.first_name,
    fullName: profile.full_name || null,
    id: profile.id,
    identifier: profile.username,
    lastName: profile.last_name,
    username: profile.username,
  };
}

export const profileService = {
  async getAuthenticatedProfile({
    environmentName,
    token,
  }: {
    environmentName?: ApiEnvironmentName;
    token?: string;
  } = {}) {
    const response = await profileApi.getProfile({
      environmentName,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const payload = (await response.json()) as MobileProfileResponse;

    if (typeof payload.id !== 'number' || !payload.username) {
      throw new ApiError('Profile response did not include a valid user', {
        code: 'invalid_json',
        details: payload,
        status: response.status,
        url: response.url,
      });
    }

    return normalizeProfile(payload);
  },
};
