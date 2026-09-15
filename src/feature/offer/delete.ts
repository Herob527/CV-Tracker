import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";

const deleteOfferSchema = z.object({
  id: z.string().uuid(),
});

export const remove = defineAction({
  input: deleteOfferSchema,
  handler: async (input, { locals }) => {
    const { jobOfferService, user } = locals;
    if (!user) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      });
    }

    const result = await jobOfferService.deleteOffer(
      input.id,
      user.Id as string,
    );

    if (result.notFound) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "Offer not found",
      });
    }
    return { success: true };
  },
});
