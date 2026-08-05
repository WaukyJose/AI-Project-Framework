import { HttpClient } from '../api/HttpClient';
import { ProfileMapper } from '../mappers/ProfileMapper';
import type { ProfileDto } from '../../types/dto/ProfileDto';
import type { UserProfile } from '../../types/domain/UserProfile';

/**
 * Repository for the authenticated user's profile data.
 *
 * Orchestrates: GET /api/mobile/profile/ → ProfileDto → UserProfile
 */
export const ProfileRepository = {
  /**
   * Retrieves the authenticated user's profile.
   * Requires a valid Bearer token (injected automatically by HttpClient).
   */
  async getProfile(): Promise<UserProfile> {
    const dto = await HttpClient.get<ProfileDto>('/api/mobile/profile/');

    return ProfileMapper.fromDto(dto);
  },
};
