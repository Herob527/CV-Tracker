import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { COOKIE_NAME, COOKIE_OPTIONS } from "@core/services/JwtService";
import bcrypt from "bcrypt";

export const login = defineAction({
  input: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
  handler: async (input, context) => {
    const { userService, jwtService } = context.locals;

    const user = await userService.getUserByEmail(input.email);
    if (!user) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const valid = await bcrypt.compare(input.password, user.Password);
    if (!valid) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const { Password: _, ...userWithoutPassword } = user;
    const token = await jwtService.generateJwt(userWithoutPassword);

    context.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);

    return { success: true };
  },
});
