import { defineMiddleware, sequence } from "astro:middleware";
import JobOfferService from "@core/services/JobOfferService";
import jwtService, { COOKIE_NAME } from "@core/services/JwtService";
import UserService from "@core/services/UserService";
import { drizzle } from "drizzle-orm/node-postgres";

// biome-ignore lint/style/noNonNullAssertion: env var required at startup
const dbUrl = process.env.DATABASE_URL!;
const db = drizzle(dbUrl);

const initDeps = defineMiddleware((context, next) => {
  context.locals.db = db;
  context.locals.jwtService = jwtService;
  context.locals.userService = new UserService(db);
  context.locals.jobOfferService = new JobOfferService(db);
  context.locals.user = null;
  return next();
});

const loginCheck = defineMiddleware(async (context, next) => {
  const token = context.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    const { payload, isExpired, unknownFailure } =
      await jwtService.verifyJwt(token);
    if (!isExpired && !unknownFailure) {
      context.locals.user = payload;
    } else if (isExpired) {
      context.cookies.delete(COOKIE_NAME, { path: "/" });
    }
  }
  return next();
});

export const onRequest = sequence(initDeps, loginCheck);
