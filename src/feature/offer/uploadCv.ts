import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";

export const uploadCv = defineAction({
  input: z.object({
    id: z.string().uuid(),
    fileName: z.string().min(1).max(255),
    fileBase64: z.string().min(1),
  }),
  accept: "json",
  handler: async (input, { locals }) => {
    const { jobOfferService, user } = locals;
    if (!user) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      });
    }

    const existing = await jobOfferService.getOfferById(
      input.id,
      user.Id as string,
    );
    if (!existing) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "Offer not found",
      });
    }

    const result = await jobOfferService.updateOffer(
      input.id,
      user.Id as string,
      {
        CvFile: Buffer.from(input.fileBase64, "base64"),
        CvFileName: input.fileName,
      },
    );

    if (result.notFound) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "Offer not found",
      });
    }
    return { success: true, fileName: input.fileName };
  },
});
