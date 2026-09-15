import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";

const createOfferSchema = z.object({
  companyName: z.string().min(1).max(255),
  jobTitle: z.string().min(1).max(255),
  status: z.enum(["Applied", "Interview", "Offer", "Declined"]).optional(),
  description: z.string().optional(),
  companyAddress: z.string().max(500).optional(),
  companyEmail: z.string().email().optional(),
  companyPhone: z.string().max(50).optional(),
  cvFileName: z.string().max(255).optional(),
  cvFileBase64: z.string().optional(),
});

export const create = defineAction({
  input: createOfferSchema,
  handler: async (input, { locals }) => {
    const { jobOfferService, user } = locals;
    if (!user) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      });
    }

    const result = await jobOfferService.createOffer({
      OwnerId: user.Id as string,
      CompanyName: input.companyName,
      JobTitle: input.jobTitle,
      Status: input.status ?? "Applied",
      Description: input.description ?? null,
      CompanyAddress: input.companyAddress ?? null,
      CompanyEmail: input.companyEmail ?? null,
      CompanyPhone: input.companyPhone ?? null,
      CvFile: input.cvFileBase64
        ? Buffer.from(input.cvFileBase64, "base64")
        : null,
      CvFileName: input.cvFileName ?? null,
    });

    if (result.isError) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create offer",
      });
    }
    return { success: true, offer: result.offer };
  },
});
