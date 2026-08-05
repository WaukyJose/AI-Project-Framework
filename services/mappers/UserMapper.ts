import type { UserDto } from '../../types/dto/UserDto';
import type { User } from '../../types/domain/User';
import { MappingError } from './MappingError';

const DTO_NAME = 'UserDto';

/**
 * Pure mapper: converts a UserDto (snake_case transport) into
 * a strongly-typed User domain model (camelCase).
 *
 * Validates required fields per PART1_TRANSPORT_AUTHORITY.md.
 * Nullable fields (display_name, email) are preserved as null.
 */
export const UserMapper = {
  fromDto(dto: UserDto): User {
    if (dto === null || dto === undefined) {
      throw new MappingError('root', 'UserDto is null or undefined', DTO_NAME);
    }

    if (typeof dto.id !== 'number') {
      throw new MappingError('id', `Expected number, got ${typeof dto.id}`, DTO_NAME);
    }

    if (typeof dto.identifier !== 'string' || dto.identifier.length === 0) {
      throw new MappingError(
        'identifier',
        `Expected non-empty string, got ${typeof dto.identifier}`,
        DTO_NAME,
      );
    }

    if (typeof dto.is_staff !== 'boolean') {
      throw new MappingError(
        'is_staff',
        `Expected boolean, got ${typeof dto.is_staff}`,
        DTO_NAME,
      );
    }

    // Nullable fields: validate type if present, but allow null
    if (dto.display_name !== null && dto.display_name !== undefined && typeof dto.display_name !== 'string') {
      throw new MappingError(
        'display_name',
        `Expected string or null, got ${typeof dto.display_name}`,
        DTO_NAME,
      );
    }

    if (dto.email !== null && dto.email !== undefined && typeof dto.email !== 'string') {
      throw new MappingError(
        'email',
        `Expected string or null, got ${typeof dto.email}`,
        DTO_NAME,
      );
    }

    return {
      id: dto.id,
      identifier: dto.identifier,
      displayName: dto.display_name ?? null,
      email: dto.email ?? null,
      isStaff: dto.is_staff,
    };
  },
};
