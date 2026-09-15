import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";

const listOffersSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  status: z.string().optional(),
  search: z.string().optional(),
});

export const list = defineAction({
  input: listOffersSchema,
  handler: async (input, { locals }) => {
    const { jobOfferService, user } = locals;
    if (!user) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      });
    }

    const result = await jobOfferService.getOffersByOwnerId(
      user.Id as string,
      input.page,
      { status: input.status, search: input.search },
    );
    return { success: true, ...result };
  },
});
