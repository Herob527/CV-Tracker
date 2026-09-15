import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import type { drizzle } from "drizzle-orm/node-postgres";

type Drizzle = ReturnType<typeof drizzle>;

function getDatabaseError(error: unknown): { code: string } | null {
  if (typeof error === "object" && error !== null && "code" in error) {
    return error as { code: string };
  }
  return null;
}

const OPSTATUS = { UNIQUE_VIOLATION: "23505" } as const;

export default class UserService {
  #db;
  constructor(db: Drizzle) {
    this.#db = db;
  }

  async getUserByEmail(email: string) {
    const user = await this.#db
      .select()
      .from(users)
      .where(eq(users.Email, email))
      .limit(1);
    if (user.length === 0) return null;
    return user[0];
  }

  async getUserById(id: string) {
    const user = await this.#db
      .select()
      .from(users)
      .where(eq(users.Id, id))
      .limit(1);
    if (user.length === 0) return null;
    return user[0];
  }

  async createUser(input: {
    email: string;
    name: string;
    surname: string;
    password: string;
    role: "user" | "admin";
  }) {
    try {
      const user = await this.#db
        .insert(users)
        .values({
          Email: input.email,
          Name: input.name,
          Surname: input.surname,
          Password: input.password,
          Role: input.role,
        })
        .returning();
      return {
        user: user[0],
        isDuplicate: false,
        isUnknownError: false,
      } as const;
    } catch (error) {
      const dbError = getDatabaseError(error);
      if (dbError && dbError.code === OPSTATUS.UNIQUE_VIOLATION) {
        return {
          user: null,
          isDuplicate: true,
          isUnknownError: false,
        } as const;
      }
      return { user: null, isDuplicate: false, isUnknownError: true } as const;
    }
  }
}
