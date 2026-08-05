/**
 * Transport DTO for the User object as returned by the Django backend.
 * Appears in: login response, validate response, and dashboard payload.
 *
 * Mirrors: PART1_TRANSPORT_AUTHORITY.md § Field Dictionary
 */
export interface UserDto {
  id: number;
  identifier: string;
  display_name: string | null;
  email: string | null;
  is_staff: boolean;
}
