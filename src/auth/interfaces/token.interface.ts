export default interface TokenPayload {
  email: string;
  sub: string;
  iat: number;
  exp: number;
}
