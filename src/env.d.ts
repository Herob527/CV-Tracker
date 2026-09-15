/// <reference types="astro/client" />

import type JobOfferService from "@core/services/JobOfferService";
import type jwtService from "@core/services/JwtService";
import type UserService from "@core/services/UserService";
import type { drizzle } from "drizzle-orm/node-postgres";

declare global {
  interface Deps {
    db: ReturnType<typeof drizzle>;
    jwtService: typeof jwtService;
    userService: InstanceType<typeof UserService>;
    jobOfferService: InstanceType<typeof JobOfferService>;
    user: Record<string, unknown> | null;
  }
  namespace App {
    interface Locals extends Deps {}
  }
}
