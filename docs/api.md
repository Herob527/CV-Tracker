# Aggregation

You'll be using drizzle for database operations and Astro in SSR mode

To enable DI-ish behaviour, you'll use middleware to inject deps like services or db into middleware into context.locals

Example:

```ts
const initDeps = defineMiddleware((context, next) => {
  const deps: Partial<Deps> = {};
  deps.db = drizzle(dbUrl);
  deps.userService = new UserService(deps.db);
  deps.companyService = new CompanyService(deps.db);
  deps.jwtService = jwtService;
  Object.assign(context.locals, deps);
  return next();
});
```

Mind to update env.d.ts as well:

```ts
/// <reference types="astro/client" />

import type { drizzle } from "drizzle-orm/node-postgres";
import type jwtService from "@core/services/JwtService";
import type CompanyService from "@core/services/CompanyService";
import type UserService from "@core/services/UserService";

declare global {
  interface Deps {
    db: ReturnType<typeof drizzle>;
    jwtService: typeof jwtService;
    userService: InstanceType<typeof UserService>;
    companyService: InstanceType<typeof CompanyService>;
  }
  namespace App {
    interface Locals extends Deps {}
  }
}
```

Then you'll be able to use `context.locals.db` or other things in actions for example or API endpoints

```ts
export default defineAction({
  input: loginSchema,
  handler: async (input, context) => {
    try {
      const { jwtService, userService } = context.locals;
      // ...
      }}})
```

For modifying actions, you'll use astro actions
Each action will be CQRS-ish, so there will be an attribute (entity-like folder) and action files.
So it'd look like this:

```
src/feature/
  user/
    create.ts
    login.ts
    logout.ts
  job-offer/
    create.ts
    update.ts
```

`user` and `job-offer` are entity folders (attributes).
`create`, `update`, etc. are actions (mostly single `.ts` files)

For each you'll use zod schema for validation

Authentication will use JWT generated/verified with jose and stored in an httpOnly cookie.

Note the password must never be stored inside the JWT.

JWT handling (generation, verification, cookie management) will be wrapped in a jwtService.

Passwords will be hashed with bcrypt.

Auth is enforced in pages and actions by throwing errors:
- **401** if unauthenticated → redirect to login
- **403** if forbidden (e.g. not own entry) → show "access forbidden"

Only register and login are public. index.astro is an informational page describing how CV tracking works; everything else requires an authenticated user.

Services will be classes that wraps db operations so later, they can be used in api endpoints or actions

By itself, these accepts db as param in constructor and db param will be private

Example:

```ts
export default class UserService {
  #db;
  constructor(db: Drizzle) {
    this.#db = db;
  }

  async getUserByEmail(email: string) {
    const user = await this.#db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (user.length === 0) return null;
    return user[0];
  }
}
```

By itself, service shouldn't throw an error, but return error object if something goes wrong, so action would throw appropriate error

Example:

```ts
async createUser(input: z.infer<typeof registerSchema>, password: string) {
try {
  const user = await this.#db
    .insert(users)
    .values({
      email: input.email,
      name: input.name,
      surname: input.surname,
      password: password,
      roles:
        input.registerAs === "candidate"
          ? ["candidate"]
          : ["candidate", "corporate"],
    })
    .returning();
  return {
    user: user[0],
    isDuplicate: false,
    isUnknownError: false,
  } as const;
} catch (error) {
  const dbError = getDatabaseError(error);
  if (dbError && dbError.code === OPSTATUS.UNIQUE_VIOLATION.toString()) {
    return {
      user: null,
      isDuplicate: true,
      isUnknownError: false,
    } as const;
  }

  return { user: null, isDuplicate: false, isUnknownError: true } as const;
}
```

jwtService will be a singleton instance wrapping jose, placed in src/core/services/JwtService.ts. Import it and attach to deps in the middleware as `deps.jwtService = jwtService;`

Note the password is never included in the JWT payload (the payload type is the user select minus `password`).

Under any circumstance, you'll not use db in actions unless strictly necessary

General preference is to create service that'll handle db operations for you
