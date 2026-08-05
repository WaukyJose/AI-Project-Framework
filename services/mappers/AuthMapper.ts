import type { AuthSuccessDto, AuthResponseDto } from '../../types/dto/AuthDto';
import type { AuthSession } from '../../types/domain/AuthSession';
import { UserMapper } from './UserMapper';
import { MappingError } from './MappingError';

const DTO_NAME = 'AuthSuccessDto';

/**
 * Pure mapper: converts an AuthSuccessDto into an AuthSession domain model.
 *
 * Only maps success payloads (authenticated === true).
 * Callers must discriminate AuthResponseDto before calling.
 */
export const AuthMapper = {
  /**
   * Converts a successful auth transport DTO into an AuthSession.
   * Throws MappingError if required fields are missing or invalid.
   */
  toSession(dto: AuthSuccessDto): AuthSession {
    if (dto === null || dto === undefined) {
      throw new MappingError('root', 'AuthSuccessDto is null or undefined', DTO_NAME);
    }

    if (dto.authenticated !== true) {
      throw new MappingError(
        'authenticated',
        `Expected true, got ${dto.authenticated}`,
        DTO_NAME,
      );
    }

    if (typeof dto.token !== 'string' || dto.token.length === 0) {
      throw new MappingError(
        'token',
        `Expected non-empty string, got ${typeof dto.token}`,
        DTO_NAME,
      );
    }

    if (dto.user === null || dto.user === undefined) {
      throw new MappingError('user', 'User object is null or undefined', DTO_NAME);
    }

    const user = UserMapper.fromDto(dto.user);

    return {
      authenticated: true,
      token: dto.token,
      user,
    };
  },

  /**
   * Convenience discriminator: returns true if the response
   * envelope indicates a successful authentication payload.
   */
  isSuccess(dto: AuthResponseDto): dto is AuthSuccessDto {
    return dto.authenticated === true;
  },
};
