import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { COOKIE_NAME, COOKIE_OPTIONS } from "@core/services/JwtService";
import bcrypt from "bcrypt";

export const register = defineAction({
  input: z.object({
    email: z.string().email(),
    name: z.string().min(1).max(100),
    surname: z.string().min(1).max(100),
    password: z.string().min(8).max(128),
  }),
  handler: async (input, context) => {
    const { userService, jwtService } = context.locals;

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const result = await userService.createUser({
      email: input.email,
      name: input.name,
      surname: input.surname,
      password: hashedPassword,
      role: "user",
    });

    if (result.isDuplicate) {
      throw new ActionError({
        code: "CONFLICT",
        message: "Email already in use",
      });
    }
    if (result.isUnknownError) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Registration failed",
      });
    }

    const { Password: _, ...userWithoutPassword } = result.user;
    const token = await jwtService.generateJwt(userWithoutPassword);

    context.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);

    return { success: true };
  },
});
