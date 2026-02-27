export interface JwtPayload {
  sub: string;
  email: string | null;
  is_guest: boolean;
  iat?: number;
  exp?: number;
}
