/**
 * Transport DTO for GET /api/mobile/profile/
 *
 * Mirrors: PART1_TRANSPORT_AUTHORITY.md § Response Contracts #4
 */
export interface ProfileDto {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
}
