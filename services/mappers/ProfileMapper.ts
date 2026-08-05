import type { ProfileDto } from '../../types/dto/ProfileDto';
import type { UserProfile } from '../../types/domain/UserProfile';
import { MappingError } from './MappingError';

const DTO_NAME = 'ProfileDto';

/**
 * Pure mapper: converts a ProfileDto (snake_case transport) into
 * a UserProfile domain model (camelCase).
 *
 * All fields are required per PART1_TRANSPORT_AUTHORITY.md § Field Dictionary.
 */
export const ProfileMapper = {
  fromDto(dto: ProfileDto): UserProfile {
    if (dto === null || dto === undefined) {
      throw new MappingError('root', 'ProfileDto is null or undefined', DTO_NAME);
    }

    if (typeof dto.id !== 'number') {
      throw new MappingError('id', `Expected number, got ${typeof dto.id}`, DTO_NAME);
    }

    const requiredStringFields: readonly (keyof ProfileDto)[] = [
      'username',
      'first_name',
      'last_name',
      'full_name',
      'email',
    ];

    for (const field of requiredStringFields) {
      if (typeof dto[field] !== 'string') {
        throw new MappingError(
          field,
          `Expected non-empty string, got ${typeof dto[field]}`,
          DTO_NAME,
        );
      }
    }

    return {
      id: dto.id,
      username: dto.username,
      firstName: dto.first_name,
      lastName: dto.last_name,
      fullName: dto.full_name,
      email: dto.email,
    };
  },
};
