import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";

const updateOfferSchema = z.object({
  id: z.string().uuid(),
  companyName: z.string().min(1).max(255).optional(),
  jobTitle: z.string().min(1).max(255).optional(),
  status: z.enum(["Applied", "Interview", "Offer", "Declined"]).optional(),
  description: z.string().optional(),
  companyAddress: z.string().max(500).optional(),
  companyEmail: z.string().email().optional(),
  companyPhone: z.string().max(50).optional(),
});

export const update = defineAction({
  input: updateOfferSchema,
  handler: async (input, { locals }) => {
    const { jobOfferService, user } = locals;
    if (!user) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      });
    }

    const { id, ...updates } = input;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.companyName !== undefined)
      dbUpdates.CompanyName = updates.companyName;
    if (updates.jobTitle !== undefined) dbUpdates.JobTitle = updates.jobTitle;
    if (updates.status !== undefined) dbUpdates.Status = updates.status;
    if (updates.description !== undefined)
      dbUpdates.Description = updates.description;
    if (updates.companyAddress !== undefined)
      dbUpdates.CompanyAddress = updates.companyAddress;
    if (updates.companyEmail !== undefined)
      dbUpdates.CompanyEmail = updates.companyEmail;
    if (updates.companyPhone !== undefined)
      dbUpdates.CompanyPhone = updates.companyPhone;

    const result = await jobOfferService.updateOffer(
      id,
      user.Id as string,
      dbUpdates,
    );

    if (result.notFound) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "Offer not found",
      });
    }
    return { success: true, offer: result.offer };
  },
});
