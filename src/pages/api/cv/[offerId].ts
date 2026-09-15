import type { APIRoute } from "astro";
import { eq, and } from "drizzle-orm";
import { jobOffers } from "@db/schema";

const MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const GET: APIRoute = async ({ params, locals }) => {
  const { user, jobOfferService } = locals;
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const offerId = params.offerId;
  if (!offerId) {
    return new Response("Bad request", { status: 400 });
  }

  const offer = await jobOfferService.getOfferById(offerId, user.Id as string);
  if (!offer || !offer.CvFile || !offer.CvFileName) {
    return new Response("Not found", { status: 404 });
  }

  const ext = offer.CvFileName.split(".").pop()?.toLowerCase() ?? "bin";
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  return new Response(new Uint8Array(offer.CvFile), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${offer.CvFileName}"`,
    },
  });
};
