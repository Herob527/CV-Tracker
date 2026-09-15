/// <reference types="astro/client" />

import type JobOfferService from "@core/services/JobOfferService";
import type jwtService from "@core/services/JwtService";
import type UserService from "@core/services/UserService";
import type { drizzle } from "drizzle-orm/node-postgres";
import type { User } from "./db/schema";

declare global {
  interface Deps {
    db: ReturnType<typeof drizzle>;
    jwtService: typeof jwtService;
    userService: InstanceType<typeof UserService>;
    jobOfferService: InstanceType<typeof JobOfferService>;
    user: Omit<User, "password">;
  }
  namespace App {
    interface Locals extends Deps {}
  }
}
