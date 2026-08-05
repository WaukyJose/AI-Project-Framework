import { HttpClient } from '../api/HttpClient';
import { AuthService } from '../auth/AuthService';
import { AuthMapper } from '../mappers/AuthMapper';
import type { LoginRequestDto, AuthSuccessDto, LogoutResponseDto } from '../../types/dto/AuthDto';
import type { AuthSession } from '../../types/domain/AuthSession';

/**
 * Repository orchestrating authentication endpoints.
 *
 * Responsibilities (per PART1_API_CLIENT_ARCHITECTURE.md §5, §7):
 * - Coordinate HttpClient calls with DTO mappers.
 * - Manage token lifecycle (persist on login, purge on logout).
 * - Return only domain models — never DTOs.
 */
export const AuthRepository = {
  /**
   * Authenticates user credentials against POST /api/v1/auth/login/.
   * On success: maps transport DTO → AuthSession, persists the Bearer token,
   * and returns the session.
   *
   * The endpoint is public — no pre-existing token is required.
   */
  async login(credentials: LoginRequestDto): Promise<AuthSession> {
    const dto = await HttpClient.post<AuthSuccessDto>(
      '/api/v1/auth/login/',
      credentials,
      { requiresAuth: false },
    );

    const session = AuthMapper.toSession(dto);

    await AuthService.setToken(session.token);

    return session;
  },

  /**
   * Invalidates the current session via POST /api/v1/auth/logout/.
   * Purges the stored token regardless of server response.
   */
  async logout(): Promise<void> {
    try {
      await HttpClient.post<LogoutResponseDto>('/api/v1/auth/logout/');
    } finally {
      await AuthService.removeToken();
    }
  },

  /**
   * Validates an existing token against GET /api/v1/auth/validate/.
   * Returns a fresh AuthSession if the token is still active.
   */
  async validate(): Promise<AuthSession> {
    const dto = await HttpClient.get<AuthSuccessDto>('/api/v1/auth/validate/');

    return AuthMapper.toSession(dto);
  },
};
