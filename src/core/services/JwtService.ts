import { errors, jwtVerify, SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-me",
);
const COOKIE_NAME = "auth_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
};

class JwtService {
  private algorithm = "HS256" as const;
  private expirationTime = "7d";

  async generateJwt<T extends Record<string, unknown>>(payload: T) {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: this.algorithm })
      .setIssuedAt()
      .setExpirationTime(this.expirationTime)
      .sign(JWT_SECRET);
  }

  async verifyJwt(token: string) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET, {
        algorithms: [this.algorithm],
      });
      return { payload, isExpired: false, unknownFailure: false };
    } catch (e) {
      if (e instanceof Error && e.name === errors.JWTExpired.name) {
        return { payload: null, isExpired: true, unknownFailure: false };
      }
      console.error({ func: "verify", e });
      return { payload: null, isExpired: false, unknownFailure: true };
    }
  }
}

const jwtService = new JwtService();
export { COOKIE_NAME, COOKIE_OPTIONS };
export default jwtService;
