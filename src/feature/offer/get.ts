import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";

export const get = defineAction({
  input: z.object({ id: z.string().uuid() }),
  handler: async (input, { locals }) => {
    const { jobOfferService, user } = locals;
    if (!user) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      });
    }

    const offer = await jobOfferService.getOfferById(
      input.id,
      user.Id as string,
    );
    if (!offer) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "Offer not found",
      });
    }

    const changes = await jobOfferService.getOfferChanges(input.id);
    return { success: true, offer, changes };
  },
});
