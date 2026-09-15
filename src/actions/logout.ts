import { defineAction } from "astro:actions";
import { COOKIE_NAME } from "@core/services/JwtService";

export const logout = defineAction({
  handler: async (_input, context) => {
    context.cookies.delete(COOKIE_NAME, { path: "/" });
    return { success: true };
  },
});
