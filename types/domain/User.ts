export interface User {
  readonly id: number;
  readonly identifier: string;
  readonly displayName: string | null;
  readonly email: string | null;
  readonly isStaff: boolean;
}
