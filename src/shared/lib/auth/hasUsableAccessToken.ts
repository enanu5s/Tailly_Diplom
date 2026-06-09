export function hasUsableAccessToken(token: string | null | undefined): boolean {
  if (!token) {
    return false;
  }

  // Backend expects JWT Bearer token for protected /me/* endpoints.
  const jwtSegments = token.split('.');
  return jwtSegments.length === 3 && jwtSegments.every((segment) => segment.length > 0);
}
