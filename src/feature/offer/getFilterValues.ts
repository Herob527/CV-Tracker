import { ActionError, defineAction } from "astro:actions";

export const getFilterValues = defineAction({
  handler: async (_, { locals }) => {
    const { jobOfferService, user } = locals;
    if (!user) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      });
    }

    const result = await jobOfferService.getFilterValues(user.Id);
    return { success: true, ...result };
  },
});
